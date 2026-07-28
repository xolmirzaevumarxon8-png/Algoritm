# Enterprise LMS - Learning Center Management System 🚀

An enterprise-grade, multi-tenant Learning Management System (LMS) designed for Educational Institutions and Learning Centers. Features modern SaaS aesthetics, real-time analytics, role-based access control (RBAC), automatic receipt generation, and comprehensive academic tracking.

---

## 🌟 Key Features by Role

| Role | Primary Features |
| :--- | :--- |
| **Super Admin** 👑 | Multi-branch oversight, 1-Click Database Backup, system settings & SMS gateway config |
| **Director** 📊 | Financial analytics, revenue distribution, staff activity monitoring, export reports |
| **Admin** 🛠️ | Student & teacher management, course creation, group scheduling, room allocation, audit logs |
| **Cashier** 💳 | Real-time payment processing, printable receipt modal (Z-Report), expense tracking, student profiles |
| **Teacher** 🎓 | Group attendance tracking, homework assignment & grading, quiz management, student leaderboards |
| **Student** 📚 | Homework submission, weekly timetable calendar, payment history, interactive exam solver, XP leaderboard |
| **Parent** 👨‍👩‍👧 | Multi-child switcher, academic progress tracking, attendance monitoring, payment receipts |
| **Call Center / CRM** 📞 | Lead management, CRM sales funnel, conversion analytics |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, Framer Motion, Recharts, Lucide Icons, Vite, React Query, Zustand, i18next
- **Backend**: Node.js, Express.js (v5), TypeScript, Prisma ORM, SQLite (Dev) / PostgreSQL (Prod), Socket.IO, JWT Auth, Bcrypt, Zod
- **Architecture**: Monorepo with npm Workspaces (`/backend`, `/frontend`)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation & Execution

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd oquv-markaz
   ```

2. **Install all dependencies** (installs both backend & frontend via workspaces):
   ```bash
   npm install
   ```

3. **Start Development Servers** (runs Backend on port 5000 & Frontend on port 5173 concurrently):
   ```bash
   npm run dev
   ```

4. **Access Applications**:
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000/api`

---

## 🔐 Default Access Credentials (Local Dev)

| Role | Username / Phone | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `superadmin123` |
| **Cashier** | `kassir` (or `gayrat`) | `1234` (or `4444`) |
| **Admin** | `Turmuq` | `5566` |
| **Teacher** | `+998885719971` | `9971` |
| **Student** | Student Phone | Last 4 digits of phone |

---

## 🗄️ Database & Prisma Commands

```bash
# Push database schema changes (SQLite dev.db)
npm run db:push

# Generate Prisma Client
npm run db:generate
```

---

## 🌿 Branching Strategy

- `main` — Production-ready code
- `develop` — Active development branch
- `feature/*` — New feature branches
- `fix/*` — Bug fix branches

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
