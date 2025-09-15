#include <WiFi.h>
#include <HTTPClient.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Wire.h>
#include <Adafruit_PN532.h>
#include <time.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://a*.*.****:8443/api/v1/timesheet/employee"; //YOUR_DOMAIN/ADDRESS
AsyncWebServer server(80);
AsyncEventSource events("/events");

#define SDA_PIN      21
#define SCL_PIN      22
#define CHECK_PIN    4
#define LED_PIN      2

Adafruit_PN532 nfc(SDA_PIN, SCL_PIN);

const char* ntpServer = "ro.pool.ntp.org";
const char* tz_Romania = "EET-2EEST,M3.5.0/3,M10.5.0/4";

String lastUUID = "";
bool lastButtonState = LOW;
unsigned long lastCardTime = 0;
const unsigned long debounceInterval = 3000;

const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Licenta ESP32</title>
    <style>
      body {
        height: 100vh;
        width: 100vw;
        font-family: Arial; 
        text-align: center; 
        margin-top: 50px; 
        background-color: black; 
        color: white; 
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      h1 { font-size: 2em; }
      .ro, .en { font-size: 1.5em; margin: 10px 0; }
      
      .loader {
        border: 16px solid #f3f3f3; 
        border-top: 16px solid #3498db;
        border-radius: 50%;
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body >
    <div id="main"></div>
    <script>
      let t = 0;
      var htmlElements = `<h1></h1>
        <div class="ro"><span></span></div>
        <div class="en"><span></span></div>`
      document.getElementById("main").innerHTML = htmlElements;
      function time() {
        clearTimeout(t);
        var d = new Date()
        document.getElementsByTagName("h1")[0].innerHTML = d.toLocaleTimeString();
        document.getElementsByTagName("span")[0].innerHTML = "Bine ai venit!";
        document.getElementsByTagName("span")[1].innerHTML = "Welcome!";
        t = setTimeout(function () { time() }, 1000); }time();
      const evtSource = new EventSource('/events');
      evtSource.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          if(data.status == "fetching") {
            htmlElements = `<div class="loader"></div>`;
            clearTimeout(t);
            document.getElementById("main").innerHTML = htmlElements;
          }
          if(data.status == "201") {
            htmlElements = `
              <h1>&#x2705; ${data.ora} </h1>
              <div class="ro"><span>${data.clock == "in" ? "&#x1F4F2;Intrarea a fost înregistrată!" : data.clock == "out" ? "&#x1F4F4;Ieșire înregistrată!" : "&#x1F4F5;E Ok, dar eroare"}</span></div>
              <div class="en"><span>${data.clock == "in" ? "&#x1F4F2;Clocked in successfully!" : data.clock == "out" ? "&#x1F4F4;Clocked out successfully!" : "&#x1F4F5;It's Ok, but error"}</span></div>
            `
            document.getElementById("main").innerHTML = htmlElements;
            clearTimeout(t);
            t = setTimeout(function () { time() }, 5000);
          }
          if(data.status == "409") {
            htmlElements = `
              <h1>&#x274C; ${data.ora}</h1>
              <div class="ro"><span>${data.clock == "in" ? "&#x1F557;Ți-ai înregistrat deja intrarea!" : data.clock == "out" ? "&#x1F554;Ți-ai înregistrat deja ieșirea!" : "&#x1F5D1;E Ok, dar eroare"}</span></div>
              <div class="en"><span>${data.clock == "in" ? "&#x1F557;Clocked in already registered!" : data.clock == "out" ? "&#x1F554;Clocked out already registered!" : "&#x1F5D1;It's Ok, but error"}</span></div>
            `
            document.getElementById("main").innerHTML = htmlElements;
            clearTimeout(t);
            t = setTimeout(function () { time() }, 5000);
          }
          if(data.status =="406" && data.clock == "out") {
            htmlElements = `
              <h1>&#x274C; ${data.ora}</h1>
              <div class="ro"><span>&#x1F933;Nu poți ieși! Nu ți-ai înregistrat intrarea!</span></div>
              <div class="en"><span>&#x1F933;You can't clock out! You should clock in frist!</span></div>
            `
            document.getElementById("main").innerHTML = htmlElements;
            clearTimeout(t);
            t = setTimeout(function () { time() }, 5000);
          }
          if(data.status == "400" && data.clock == "out" ) {
            htmlElements = `
              <h1>&#x274C; ${data.ora}</h1>
              <div class="ro"><span>&#x1F6C7;Eroare! Nu poți ieși... Ești un călător în timp?!&#x1F6B6;</span></div>
              <div class="en"><span>&#x1F6C7;Error! You can't clock out... You are a time traveler?!&#x1F6B6;</span></div>
            `
            document.getElementById("main").innerHTML = htmlElements;
            clearTimeout(t);
            t = setTimeout(function () { time() }, 5000);
          }
        } catch (e) {console.error("Eroare la parsare SSE:", event.data);}
      };
    </script>
  </body>
</html>
)rawliteral";


String formatUUID(uint8_t* data) {
  char uuid[37];
  sprintf(uuid,
          "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
          data[0], data[1], data[2], data[3],
          data[4], data[5],
          data[6], data[7],
          data[8], data[9],
          data[10], data[11], data[12], data[13], data[14], data[15]);
  return String(uuid);
}

String getCurrentTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return "00:00";
  char timeStr[6];
  strftime(timeStr, sizeof(timeStr), "%H:%M", &timeinfo);
  return String(timeStr);
}

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectare la WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    delay(500);
    Serial.print(".");
  }
  digitalWrite(LED_PIN, HIGH);
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  pinMode(CHECK_PIN, INPUT_PULLDOWN);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  connectToWiFi();
  configTzTime(tz_Romania, ntpServer);

  nfc.begin();
  if (!nfc.getFirmwareVersion()) {
    Serial.println("PN532 nu este detectat.");
    while (1);
  }
  nfc.SAMConfig();
  Serial.println("Se asteapta rfid tag/card...");

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/html", index_html);
  });

  server.addHandler(&events);
  server.begin();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, LOW);
    connectToWiFi();
  } else {
    digitalWrite(LED_PIN, HIGH);
  }

  uint8_t uid[7], uidLength;
  if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
    uint8_t keya[] = { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF };
    if (nfc.mifareclassic_AuthenticateBlock(uid, uidLength, 4, 0, keya)) {
      uint8_t data[16];
      if (nfc.mifareclassic_ReadDataBlock(4, data)) {
        String currentUUID = formatUUID(data);
        bool buttonState = digitalRead(CHECK_PIN);

        if ((millis() - lastCardTime) < debounceInterval &&
            currentUUID == lastUUID &&
            buttonState == lastButtonState) {
              return;
        }

        lastUUID = currentUUID;
        lastButtonState = buttonState;
        lastCardTime = millis();

        String ora = getCurrentTime();
        String body = "{\"employee_uuid\":\"" + currentUUID + "\",\"" +
                      (buttonState == HIGH ? "clock_in" : "clock_out") +
                      "\":\"" + ora + "\"}";
        Serial.println(body);
        if (WiFi.status() == WL_CONNECTED) {
          HTTPClient http;
          http.begin(serverURL);
          http.addHeader("Content-Type", "application/json");
          events.send("{\"status\":\"fetching\"}", "message", millis());
          int httpResponseCode = http.POST(body);
          String json = "{\"status\":\"" + String(httpResponseCode) + "\",\"clock\":\"" + String(buttonState == HIGH ? "in" : "out") + "\",\"ora\":\"" + ora + "\"}";
          Serial.println(json);
          events.send(json.c_str(), "message", millis());
          http.end();
        }
      }
    }
    delay(1000);
  }
}