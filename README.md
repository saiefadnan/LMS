# LearnHub — Full-Stack Learning Management System (LMS)

A modern, production-grade Learning Management System (LMS) built with **Next.js 15 (App Router)**, **Strapi 5 (Headless CMS)**, **PostgreSQL / SQLite**, and **TanStack Query**.

---

## Architecture & Tech Stack

- **Frontend:**
  - **Framework:** Next.js 15 (Turbopack, App Router, React 19)
  - **State & Server Cache:** TanStack Query v5 + Zustand
  - **Styling:** TailwindCSS v4 with Dark / Light Theme Support
  - **Form Handling:** React Hook Form + Zod validation
  - **Icons:** Lucide React
- **Backend:**
  - **CMS / Server:** Strapi 5 (Headless CMS)
  - **Database:** PostgreSQL (Production) / SQLite (Local default)
  - **Authentication:** Strapi Users-Permissions plugin with JWT
  - **Authorization:** Custom Strapi Global Policies (`is-admin`, `is-course-manager`, `is-student`)
  - **API Architecture:** Dedicated Service Layer with Server-Side Pagination and Relational Ownership Verification

---

## Project Structure

```text
LMS/
├── backend/                  # Strapi 5 Headless CMS
│   ├── src/
│   │   ├── api/              # Domain APIs (course, lesson, quiz, quiz-result, blog-post, progress, enrollment)
│   │   │   └── [module]/
│   │   │       ├── controllers/   # HTTP Request Handlers
│   │   │       ├── services/      # Business & Database Logic
│   │   │       ├── routes/        # Custom and Core Routes
│   │   │       └── content-types/ # Schemas & Relational Attributes
│   │   └── policies/         # Custom RBAC Global Policies
│   └── package.json
│
├── frontend/                 # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router Pages (20 Routes)
│   │   ├── components/       # Reusable UI & Feature Components
│   │   ├── config/           # Centralized API Endpoints (Single Source of Truth)
│   │   ├── hooks/queries/    # TanStack Query & Mutation Hooks
│   │   ├── lib/api/          # Typed API Client & Services
│   │   ├── stores/           # Zustand Auth, Modal & Theme Stores
│   │   └── types/            # TypeScript Domain Definitions
│   └── package.json
│
└── README.md
```

---

## Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher (Recommended: `v20.18.0`+)
- **npm**: `v10.x` or higher
- **Git**

---

## Step-by-Step Local Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/saiefadnan/LMS.git
cd LMS
```

---

### 2. Backend Setup (Strapi 5)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the environment configuration file:
   ```bash
   # Copy the example file to .env
   cp .env.example .env
   ```

4. *(Optional)* Verify your `.env` settings:
   ```env
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS="toBeModified1,toBeModified2"
   API_TOKEN_SALT=tobemodified
   ADMIN_JWT_SECRET=tobemodified
   TRANSFER_TOKEN_SALT=tobemodified
   JWT_SECRET=tobemodified
   ENCRYPTION_KEY=tobemodified
   ```

5. Start the Strapi development server:
   ```bash
   npm run develop
   ```
   > Strapi will build the admin panel and start at **`http://localhost:1337/admin`**.

---

### 3. Initial Strapi Configuration (First-Time Only)

1. Open your browser and visit: **`http://localhost:1337/admin`**.
2. Complete the initial form to create the **Super Admin account**.
3. **Configure Public & Authenticated Permissions**:
   - Go to **Settings** ➔ **Users & Permissions Plugin** ➔ **Roles**.
   - Under **Authenticated** role, ensure the appropriate permissions are enabled for `Course`, `Lesson`, `Quiz`, `Quiz-Result`, `Progress`, `Enrollment`, and `Blog-Post`.
4. *(Optional)* Seed initial course categories and test content through the Strapi Admin UI or via the Next.js frontend studio.

---

### 4. Frontend Setup (Next.js 15)

1. Open a **new terminal tab** and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the `frontend/` root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:1337
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   > The frontend application will be live at **`http://localhost:3000`**.

---

## Local Service URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | Next.js 15 Public Portal & Dashboard |
| **Strapi Admin Panel** | `http://localhost:1337/admin` | Strapi Headless CMS Control Panel |
| **Strapi REST API** | `http://localhost:1337/api` | Backend API Root |

---

## Role-Based Access Testing

You can register users via the frontend (`http://localhost:3000/register`) to test different role capabilities:

1. **Student (`student`):**
   - Browse published courses catalog with server pagination and search.
   - 1-click enroll in courses.
   - Access video and reading lessons with real-time lesson completion tracking.
   - Take interactive MCQ quizzes with instant auto-grading.
   - Track progress on the personal learning dashboard.

2. **Instructor (`instructor`):**
   - Access the Course Creation Studio (`/dashboard/courses/new`).
   - Manage lessons, curriculum order, and YouTube video embeds.
   - Create and edit interactive MCQ quizzes.
   - Review the **Enrolled Students Roster** with live progress percentages and quiz scores.

3. **Content Manager (`content_manager`):**
   - Manage courses across all instructors.
   - Access the **Blog & Editorial Manager** (`/dashboard/blog`) to create, edit, and toggle articles between `draft` and `published`.

4. **Administrator (`admin`):**
   - Access global platform revenue, user, course, and enrollment analytics.
   - Access the **User Management Panel** (`/dashboard/users`) to search, promote, and elevate user roles dynamically.

---

## Useful Development Commands

### Frontend (`frontend/`):
```bash
# Start Next.js development server (Turbopack)
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start
```

### Backend (`backend/`):
```bash
# Start Strapi with auto-reload
npm run develop

# Build Strapi admin bundle
npm run build

# Start Strapi in production mode
npm run start

# Run TypeScript type check
npx tsc --noEmit
```

---

## Troubleshooting

1. **CORS Error (`Blocked by CORS policy`):**
   - Ensure the backend is running on port `1337` and the frontend `.env.local` points to `http://localhost:1337`.
   - By default, Strapi enables local CORS for `http://localhost:3000`.

2. **Database Reset (Local SQLite):**
   - If you ever need to reset local development data, delete the `.tmp/data.db` file inside `backend/` and restart `npm run develop`.

3. **Port Conflicts:**
   - If port `1337` or `3000` is already in use, free the port or specify a custom port in `.env` / `.env.local`.
