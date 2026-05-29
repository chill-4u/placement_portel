# placement_portel
# 🎓 Placement Portal — REST API Backend

A full-stack **University Placement Management System** built with **Node.js**, **Express.js**, and **JWT-based authentication**. The system supports role-based access control for three user types — **Students**, **Faculty**, and **Admins** — enabling end-to-end management of campus placement activities.

---

## 🚀 Features

- 🔐 **JWT Authentication** — Secure login with token-based session management
- 👥 **Role-Based Access Control (RBAC)** — Separate routes and permissions for Students, Faculty, and Admins
- 🎓 **Student Module** — Profile management, job application tracking, placement status updates
- 👨‍🏫 **Faculty Module** — Student oversight, placement drive coordination
- 🛡️ **Middleware Protection** — Token verification and role authorization on all protected routes
- ⚠️ **Centralized Error Handling** — Consistent error responses across all endpoints
- 🗄️ **Database Integration** — Persistent data storage via `db.js` connection layer
- ⚡ **Vite Frontend Config** — Integrated frontend build pipeline

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Authentication | JSON Web Tokens (JWT) |
| Frontend Build | Vite |
| Language | JavaScript (ES6+) |
| Database | MySQL / MongoDB (via db.js) |

---

## 📁 Project Structure

```
placement_portel/
│
├── server.js              # Entry point — starts the Express server
├── app.js                 # App configuration, middleware setup
├── vite.config.js         # Frontend build configuration
├── index.html             # Frontend entry point
│
├── db.js                  # Database connection
│
├── authController.js      # Login, register, token generation logic
├── authRoutes.js          # Auth endpoints (/login, /register)
│
├── studentController.js   # Student CRUD operations & placement logic
├── studentRoutes.js       # Student API routes (protected)
│
├── facultyController.js   # Faculty operations & student management
├── facultyRoutes.js       # Faculty API routes (protected)
│
├── verifyToken.js         # JWT verification middleware
├── roleMiddleware.js      # Role-based authorization middleware
├── check_user.js          # User existence validation utility
├── errorHandler.js        # Global error handling middleware
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js v16+
- npm or yarn
- MySQL or MongoDB running locally

### 1. Clone the repository

```bash
git clone https://github.com/chill-4u/placement_portel.git
cd placement_portel
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_db
```

### 4. Start the server

```bash
# Development mode
node server.js

# Or with nodemon (recommended)
npx nodemon server.js
```

Server runs at: `http://localhost:5000`

---

## 🔗 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login and get JWT token | Public |

### Student Routes — `/api/student`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get student profile | Student |
| PUT | `/profile` | Update student profile | Student |
| GET | `/placements` | View available placement drives | Student |
| POST | `/apply/:id` | Apply for a placement drive | Student |

### Faculty Routes — `/api/faculty`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/students` | View all students | Faculty |
| GET | `/placements` | Manage placement drives | Faculty |
| POST | `/placements` | Create a new placement drive | Faculty |
| PUT | `/student/:id` | Update student placement status | Faculty |

---

## 🔐 Authentication Flow

```
Client → POST /api/auth/login
       ← JWT Token

Client → GET /api/student/profile
       → Header: Authorization: Bearer <token>
       → verifyToken middleware validates JWT
       → roleMiddleware checks user role
       ← Protected resource returned
```

---

## 🧰 Middleware

| Middleware | File | Purpose |
|-----------|------|---------|
| Token Verification | `verifyToken.js` | Validates JWT on every protected route |
| Role Authorization | `roleMiddleware.js` | Restricts endpoints by user role |
| User Check | `check_user.js` | Validates user exists in DB before operations |
| Error Handler | `errorHandler.js` | Catches and formats all unhandled errors |

---

## 💡 Key Implementation Highlights

- **Stateless authentication** using JWT — no server-side sessions required
- **Separation of concerns** — controllers handle business logic, routes handle HTTP mapping
- **Middleware chaining** — every protected route passes through `verifyToken → roleMiddleware → controller`
- **Scalable folder structure** — easy to add new roles or modules without refactoring existing code

---

## 🔮 Future Enhancements

- [ ] Admin dashboard with analytics
- [ ] Email notifications for placement drive updates
- [ ] Resume upload and parsing
- [ ] Company registration and job posting module
- [ ] Real-time notifications via WebSockets
- [ ] Deployment on AWS / Render

---

## 👨‍💻 Author

**Aditya Nautiyal**
B.Tech CSE · Graphic Era Hill University, Dehradun
[GitHub](https://github.com/chill-4u) · [LinkedIn](https://linkedin.com/in/-adityanautiyal) · [Email](mailto:aditynautiyal0707@gmail.com)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
