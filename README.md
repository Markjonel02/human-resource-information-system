 **Human Resource Management System (HRMS)** built with the **MERN stack** and **JWT authentication**, designed for GitHub and future PDF export. It includes core features like scheduling, announcements, and a modern dashboard — plus additional modules to make it scalable and team-ready.

---

## 📘 Human Resource Management System (HRMS) — MERN Stack + JWT Auth

### 🧩 Overview
This HRMS is a full-stack web application built with **MongoDB, Express.js, React.js, and Node.js**, secured with **JWT authentication**. It streamlines HR operations with a modern UI, modular architecture, and scalable features for employee management, scheduling, announcements, and more.

---

### 🚀 Tech Stack
| Layer        | Technology         |
|--------------|--------------------|
| Frontend     | React.js + TailwindCSS |
| Backend      | Node.js + Express.js |
| Database     | MongoDB (Mongoose ORM) |
| Auth         | JWT (JSON Web Tokens) |
| UI Framework | Chakra UI / TailwindCSS |
| Deployment   | Vercel / Heroku / Render |
| Versioning   | GitHub |

---

### 🔐 Authentication
- **JWT-based login/signup**
- Role-based access: Admin, HR, Employee
- Secure route protection via middleware
- Password hashing with bcrypt

---

### 🧑‍💼 Core Features

#### 1. **Employee Management**
- Add/update/delete employee profiles
- Role assignment and department tagging
- Profile photo upload (Cloudinary or local)

#### 2. **Scheduler**
- Shift scheduling with calendar view
- Drag-and-drop shift assignment
- Leave request and approval workflow

#### 3. **Announcements**
- Admin/HR can post announcements
- Rich text editor for formatting
- Auto-expiry and visibility control

#### 4. **Modern Dashboard**
- KPI widgets: total employees, active shifts, pending leaves
- Charts: attendance trends, department distribution
- Notifications and quick actions

---

### 📅 Additional Modules

#### ✅ Attendance Tracking
- Daily check-in/check-out
- Geo-location or IP-based logging
- Exportable attendance reports

#### 📈 Performance Reviews
- Review cycles and feedback forms
- Rating system and comment threads
- Role-based visibility

#### 📂 Document Management
- Upload contracts, IDs, certificates
- Tag by employee and category
- Secure download links

#### 💬 Internal Messaging
- Direct messages and group chats
- Notification system
- Optional socket.io integration

---

### 🧪 Testing & CI/CD
- Unit tests with Jest
- API testing with Postman
- GitHub Actions for CI/CD

---

### 📄 API Endpoints (Sample)
```http
POST /api/auth/login
GET /api/employees
POST /api/schedule
GET /api/announcements
```

---

### 🧰 Setup Instructions

```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm start
```

---

