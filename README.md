# Smart Job Portal API

A Node.js/Express REST API for a job portal, supporting user authentication, job postings, applications, and user profiles.

## Features

- **Authentication:** Register, login, email verification, password reset.
- **Jobs:** Employers can create, update, delete, and list jobs. Public job search with filters and pagination.
- **Applications:** Job seekers can apply to jobs, upload resumes, and view their applications. Employers can view and manage applications for their jobs.
- **Profiles:** Users can manage their profile, upload avatars and resumes.
- **File Uploads:** Supports profile images and resume uploads.
- **Caching:** Job listings are cached for performance.
- **Security:** JWT auth, input validation, rate limiting, and secure headers.
- **Socket.io:** Real-time support (basic room join example).

## API Routes

### Auth (`/api/auth`)

- `POST /register` — Register a new user
- `POST /login` — Login and receive JWT
- `POST /verify-email` — Verify email with token
- `POST /password/request` — Request password reset
- `POST /password/reset` — Reset password

### Jobs (`/api/jobs`)

- `GET /` — List jobs (public, supports filters & pagination)
- `GET /:id` — Get job by ID
- `POST /` — Create job (employer only)
- `PUT /:id` — Update job (employer/admin only)
- `DELETE /:id` — Delete job (employer/admin only)
- `GET /my/jobs` — List employer's jobs

### Applications (`/api/applications`)

- `POST /jobs/:jobId/apply` — Apply to a job (seeker only, upload resume)
- `GET /my/applications` — List my applications (seeker only)
- `GET /jobs/:jobId/applications` — List applications for a job (employer only)
- `PUT /:applicationId/status` — Update application status (employer only)
- `GET /:applicationId` — Get application details (seeker/employer/admin)

### Profile (`/api/profile`)

- `GET /me` — Get my profile
- `PUT /me` — Update my profile
- `POST /me/avatar` — Upload avatar image
- `POST /me/resume` — Upload resume

### Health Check

- `GET /api/health` — Returns `{ ok: true, timestamp }`

## Setup

1. Copy `.env.example` to `.env` and fill in your config.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run in development:
   ```sh
   npm run dev
   ```
4. Build for production:
   ```sh
   npm run build
   npm start
   ```

## Folder Structure

- `src/routes/` — API route definitions
- `src/controllers/` — Route handlers
- `src/models/` — Mongoose models
- `src/middleware/` — Auth, error handling, file uploads
- `src/utils/` — Helpers (pagination, JWT, email, cache)
- `media/` — Uploaded files (avatars, resumes)
- `thumbnails/` — Generated avatar thumbnails

## Notes

- Requires MongoDB and Redis running locally (see `.env.example`).
- Uses JWT for authentication (send `Authorization: Bearer <token>`).
- File uploads use `multipart/form-data`.

---

For more details, see the source code in [`src/routes`](src/routes) and [`src/controllers`](src/controllers).
