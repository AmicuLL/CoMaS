#include <Wire.h>
#include <Adafruit_PN532.h>

#define SDA_PIN 2
#define SCL_PIN 3

Adafruit_PN532 nfc(SDA_PIN, SCL_PIN);
String serialInput = "";

void setup() {
  Serial.begin(115200);
  Serial.println(">> Started. Waiting for commands or tags...");

  nfc.begin();
  if (!nfc.getFirmwareVersion()) {
    Serial.println("!!! PN532 not responding.");
    while (1);
  }

  nfc.SAMConfig(); // Configurare modul normal
  Serial.println(">> PN532 ready.");
}

void loop() {
  // Citire comenzi din serial
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      handleCommand(serialInput);
      serialInput = "";
    } else {
      serialInput += c;
    }
  }

  // Citire card/tag si afisare UUID
  uint8_t uid[7];
  uint8_t uidLength;
  if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
    if (authBlock(uid, uidLength, 4)) {
      uint8_t data[16];
      if (nfc.mifareclassic_ReadDataBlock(4, data)) {
        Serial.print("UUID on card: ");
        printUUIDfromBytes(data);
      } else {
        Serial.println("!!! Error reading block 4.");
      }
    } else {
      Serial.println("!!! Block 4 authentication failed");
    }

    delay(2000); // asteptare 2sec => evitare citiri repetate
  }
}

void handleCommand(String input) {
  input.trim();
  input.toLowerCase();

  if (input.startsWith("register: ")) { //comanda register
    String uuidStr = input.substring(10);
    uuidStr.replace("-", ""); // cratime out

    if (uuidStr.length() != 32) {
      Serial.println("!!! Invalid UUID. Must be 32 hex characters without hyphens.");
      return;
    }

    uint8_t uuidBytes[16];
    if (!parseUUIDtoBytes(uuidStr, uuidBytes)) {
      Serial.println("!!! UUID conversion failed.");
      return;
    }

    Serial.println(">> Bring your card closer to register...");

    // Asteapta card/tag
    uint8_t uid[7];
    uint8_t uidLength;
    while (!nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
      delay(100);
    }

    if (!authBlock(uid, uidLength, 4)) {
      Serial.println("!!! Block 4 authentication failed.");
      return;
    }

    if (nfc.mifareclassic_WriteDataBlock(4, uuidBytes)) {
      Serial.println("^^^ UUID written successfully!");
    } else {
      Serial.println("!!! Card writing error.");
    }

    delay(1500);
  }
}

bool authBlock(uint8_t *uid, uint8_t uidLen, uint8_t block) {
  // Cheia default FF FF FF FF FF FF
  return nfc.mifareclassic_AuthenticateBlock(uid, uidLen, block, 0, (uint8_t *)"\xFF\xFF\xFF\xFF\xFF\xFF");
}

bool parseUUIDtoBytes(String hexStr, uint8_t *output) {
  if (hexStr.length() != 32) return false;
  for (int i = 0; i < 16; i++) {
    String byteStr = hexStr.substring(i * 2, i * 2 + 2);
    output[i] = (uint8_t) strtol(byteStr.c_str(), NULL, 16);
  }
  return true;
}

void printUUIDfromBytes(uint8_t *data) {
  for (int i = 0; i < 16; i++) {
    if (i == 4 || i == 6 || i == 8 || i == 10) Serial.print("-");
    if (data[i] < 0x10) Serial.print("0");
    Serial.print(data[i], HEX);
  }
  Serial.println();
}
