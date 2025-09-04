[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xhu30z76)

### **Project Title: Smart Job Portal (Node/Express)**

**Overview:**  
Create a Smart Job Portal in Node.js/Express where users can sign up as **Job Seekers** or **Employers**. Employers can post jobs, manage them, and view applications. Job Seekers can view jobs, apply, and track their applications. Admins can oversee everything.

---

### **Core Features & Requirements**

#### **1. Modular Structure (Express)**

- `accounts`: Authentication, User model (with seeker/employer role)
- `jobs`: Job listings, job application logic
- `dashboard`: Employer and job seeker dashboards
- `core`: Reusable utilities like email logic, pagination utils, etc.

---

#### **2. Users and Authentication**

- Custom `User` model with role: `is_employer`, `is_seeker`
- Login, logout, registration, password reset via email
- Email verification on signup (Nodemailer)

---

#### **3. Jobs Module**

- Job model: title, description, location, salary, etc.
- Employer can CRUD jobs (with ModelForm)
- Job list is paginated for seekers
- Job Seeker can apply to jobs (Form with file upload for resume)
- Relationship: `Job` has FK to `User`, `Application` has FK to `Job` and `User`

---

#### **4. Pagination**

- Paginate job listings
- Handle exceptions: `EmptyPage`, `PageNotAnInteger`

---

#### **5. API Routes**

- REST endpoints using Express Routers
- Example: `/api/jobs`, `/api/auth`, `/api/profile`, `/api/applications`

---

#### **6. Custom Model Managers**

- In `Job` model:
  - Custom manager for active jobs only
  - `Job.objects.active()` filters only active jobs

---

#### **7. Forms & ModelForms**

- Registration form (with conditional logic for roles)
- Job creation/edit form using ModelForm
- Application form using regular Form (file upload)

---

#### **8. Email Sending**

- Email on:
  - Successful registration (welcome mail)
  - Password reset
  - Application received (to employer)

---

#### **9. Dashboard**

- Employers see their job listings and received applications
- Seekers see the jobs they applied to

---

### **Advanced/Bonus Features**

- Admin moderation: admin approves jobs before publishing
- Search & filter jobs (by title, location, etc.)
- Resume preview and download
- JWT auth, Google OAuth, Redis caching, Bull queues, Socket.IO notifications, HTTPS

---
