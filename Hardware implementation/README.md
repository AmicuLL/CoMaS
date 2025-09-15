# 🛠️ CoMaS - Hardware Implementation (ESP32 + PN532)

This folder contains the hardware-related code for the **CoMaS (Company Management System)** project. It enables RFID-based employee time tracking using an **ESP32 microcontroller** and a **PN532 RFID reader module**.

## 📦 Components Used

- ESP32 Development Board (e.g., DOIT DevKit v1)
- PN532 RFID Module (I2C connection)
- MIFARE Classic RFID Tags or Cards
- Switch button (`One state for clocking in [ Could be HIGH ]. The other state is for clocking out`)
- Optional: Another ESP32 + PN532 (for individual clocking), LED
- Internet Access (WiFi)

---

## 📁 Files Included

|File|Description|
|-|-|
|`comas-rfid-attendance.ino`|Main firmware for clocking in/out using RFID and sending data to backend.|
|`comas-rfid-register.ino`|Tool to read or register UUIDs on RFID cards via serial command.|

---

## 📌 1. `comas-rfid-attendance.ino`

This sketch connects the ESP32 to a WiFi network and continuously waits for RFID tags. When a card is detected:

- It reads a **UUID from block 4**.
- It determines the action: **clock in** (if button is pressed) or **clock out** (if not).
- It sends the data as a JSON payload to the backend via HTTP POST.
- It displays feedback on a simple HTML page served locally and updates via Server-Sent Events (SSE).

### Configuration

Before uploading, make sure to replace:

```cpp
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://your-domain.com:8443/api/v1/timesheet/employee";
```
with your actual WiFi and backend API credentials.

### Optional GPIOs
- CHECK_PIN (GPIO 4): Used to determine clock-in vs. clock-out.
- LED_PIN (GPIO 2): Indicates connection and RFID reading status.

### HTML Interface

The sketch also serves a basic local page (on port 80) that displays:

- Live time
- Clock-in/out status
- Multilingual messages (Romanian and English)

---

## 🛠️ 2. `comas-rfid-register.ino`
This sketch is used to either:
1. Read the existing UUID from block 4 of a card.
2. Write a new UUID to the card using a serial command.

### How to use

- Open the Serial Monitor (baud rate: 115200).
- Bring a card near the PN532 to read its UUID.
- To register a new UUID, type the command:
`register: 123e4567e89b12d3a456426655440000` or `register: 123e4567-e89b-12d3-a456-426655440000`

>Must be a valid 32-character hex UUID (without hyphens). The sketch will write it to block 4 of the card once detected.

---

## 🧠 Notes
- The backend must validate the UUID and match it with employee records.
- The comas-rfid-attendance.ino sketch uses a debounce mechanism to prevent duplicate scans.
- All writes use default MIFARE authentication keys (FF FF FF FF FF FF) on block 4.

---
## 📷 Wiring diagram

<img width="780" alt="image" src="https://github.com/user-attachments/assets/66d5faed-dc00-4722-b561-abeeb0943a00" />


---

## 🔐 Security Notice
- Always secure your backend endpoint (https://...) with SSL/TLS.
- RFID cards are not cryptographically secure by themselves—do not store sensitive data on them.
