# CoMaS - Company Management System

CoMaS is a full-stack web application designed to simplify and automate internal management processes for small and medium-sized companies. It offers modules for employee management, projects, tasks, time tracking (manual and hardware-based), internal messaging, inventory, multilingual support, and fine-grained permissions.

---

## 🧩 Features

- ✅ **User Management**
  - Register employees via secure UUID or open self-registration
  - Assign granular permissions per action and entity
  - Role-based permission templates
  - Secure login via JWT + HTTP-only cookies

- 📁 **Projects & Tasks**
  - Create, edit, and manage projects
  - Assign employees individually or by team
  - Task tracking with dynamic progress calculation
  - Notifications for changes and assignments

- 🕒 **Time Tracking (Pontaj)**
  - Manual time input via UI
  - Hardware time tracking with **ESP32 + RFID PN532**
  - Tolerance-based auto-rounding of times
  - Smart validation: prevents duplicate or inconsistent logs

- 📦 **Inventory Module**
  - View, filter, and edit items
  - Conditional update button (only activates on real changes)
  - Refill alerts for stock below the minimum
  - Access can be revoked or restricted by permission

- 💬 **Messaging & Notifications**
  - Private messages and global broadcasts
  - Batch loading (15 messages at a time) for performance
  - System-triggered real-time notifications (via SSE)

- 🌐 **Multilingual Interface**
  - Fully responsive UI (desktop, tablet, mobile)
  - Supports **English and Romanian**
  - Light and dark themes available

---

## 🔐 Security

- JWT authentication stored in **HTTP-only cookies** (XSS-resistant)
- **Granular permission system** for all actions and entities
- Automatic **session revocation** on credential change
- REST API access secured and validated on each endpoint
- Server-Sent Events (SSE) instead of WebSocket for safer live updates

---

## 🏗️ Tech Stack

| Layer        | Technologies                            |
|--------------|------------------------------------------|
| **Frontend** | React + Vite + Mantine UI + i18next      |
| **Backend**  | Spring Boot (Java) + PostgreSQL          |
| **Security** | Spring Security + JWT + HTTP-only Cookies|
| **Hardware** | ESP32 microcontroller + PN532 RFID       |
| **Realtime** | Server-Sent Events (SSE)                 |

---

## ⚙️ Architecture

Monolithic full-stack architecture:

[ UI (React) ] ⇄ [ REST API (Spring Boot) ] ⇄ [ PostgreSQL DB ]  
                             ⇡
                     [ ESP32 + RFID ]

- Frontend and backend communicate via REST endpoints
- Real-time notifications use Server-Sent Events
- All modules are integrated in a single deployable package

---

## 🚀 Future Plans

- Cloud deployment (OpenStack / Azure)
- Two-Factor Authentication (2FA)
- Role-based dashboards
- REST API integrations with third-party services
- Inventory–project resource binding
- Live usage analytics and admin audit logs

---

## 📷 Screenshots

> (Coming up.)

- 🧑 Employee Management
- 📊 Project Dashboard
- 🔒 Secure Login
- 🕘 RFID-based Clock-In System
- 🌍 Language switch + Theme toggle

---

## 🧪 Local Development

### Prerequisites

- Node.js + npm
- Java 17+
- PostgreSQL
- ESP32 (optional for hardware testing)

### Setup

```bash
# Frontend
cd comas-frontend
npm install
npm run dev

# Backend
cd comas-backend
mvn spring-boot:run
```
Database config should be set via `application.properties`:
```bash
spring.datasource.url=jdbc:postgresql://localhost:5432/comas
spring.datasource.username=your_user
spring.datasource.password=your_password
jwt.secret=your_secret_key
```

## 👤 Author
**Berfela Ionuț**  
Bachelor's Degree Project – UTCN, Faculty of Electronics, Telecommunications and Information Technology (TST)

## 📄 License

This project is currently private / under academic development. Licensing to be defined.

