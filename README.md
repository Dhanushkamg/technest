# TechNest — Full-Stack E-Commerce Application

TechNest is a comprehensive full-stack e-commerce application built with a React frontend and a Spring Boot backend. It supports rich product browsing, robust cart and wishlist management, seamless order placement, payment processing, OAuth2 and JWT-based user authentication, guest checkout, and a full-featured admin management dashboard.

---

## Project Structure

```
technest/
├── frontend/           # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── api/        # Axios API clients
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Customer and admin pages
│   │   ├── store/      # Zustand global state
│   │   └── types/      # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/            # Spring Boot REST API (Java 21 / Maven)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/technest/backend/
│   │   │   │   ├── controller/   # REST controllers
│   │   │   │   ├── service/      # Business logic
│   │   │   │   ├── repository/   # JPA repositories
│   │   │   │   ├── entity/       # JPA entities
│   │   │   │   ├── dto/          # Data Transfer Objects
│   │   │   │   ├── config/       # Security & CORS config
│   │   │   │   └── exception/    # Global exception handling
│   │   │   └── resources/
│   │   │       ├── db/migration/ # Flyway SQL migrations (V1 to V11)
│   │   │       └── application.properties
│   │   └── test/                 # Unit tests (JUnit 5)
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
│
└── README.md
```

---

## Technologies

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| React Router v7 | Client-side routing |
| TanStack Query v5 | Server state & caching |
| Zustand | Client-side global state |
| Axios | HTTP client |
| React Hook Form + Zod | Forms & validation |
| Framer Motion | Animations |
| Lucide React | Icons |
| Sonner | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| Spring Boot 3.x | Application framework |
| Java 21 | Language |
| Spring Security | Authentication & authorization (JWT & OAuth2) |
| Spring Data JPA + Hibernate | ORM & database access |
| PostgreSQL | Relational database |
| Flyway | Database migrations |
| JJWT | JWT token generation & validation |
| Spring Mail | SMTP email verification & notifications |
| SpringDoc OpenAPI | Swagger UI API documentation |
| Maven | Build tool |

---

## Features

- **Authentication** — JWT-based login/registration, OAuth2 Google login, Email Verification, Forgot/Reset Password flows.
- **Product Catalog** — Browse, search, and filter products by category. Pagination & search functionalities included.
- **Shopping Cart & Wishlist** — Add, update, and remove items dynamically.
- **Checkout Flows** — Authenticated customer checkout as well as a complete Guest Checkout flow.
- **Payment Processing** — Simulated COD, Stripe integration for card payments, and PayPal flows.
- **Order Management** — Track order status, cancel orders with inventory restock, and download PDF invoices.
- **Admin Dashboard** — Manage products (CRUD), categories, orders, customers, and view high-level analytics.
- **API Documentation** — Auto-generated Swagger UI available at `/swagger-ui.html`.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18 and npm
- **Java 21**
- **Maven** (or use the included `mvnw` wrapper)
- **PostgreSQL** running locally on port `5432`

---

### Backend Setup

1. **Create the database:**
```sql
CREATE DATABASE ecommerce_db;
```

2. **Configure environment variables** — set them in your environment or via your IDE run configurations:
```properties
# Required for OAuth2 & Email integrations
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=<your-google-client-id>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SPRING_MAIL_USERNAME=<your-smtp-email>
SPRING_MAIL_PASSWORD=<your-smtp-password>
```

3. **Update DB credentials** in `backend/src/main/resources/application.properties` if different from the defaults (`postgres` / `postgres123`).

4. **Run the backend:**
```bash
cd backend
# Linux / macOS
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run
```

   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html

---

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure the API URL** in `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

3. **Run the dev server:**
```bash
npm run dev
```

   App: http://localhost:5173

---

## Default Seed Credentials

Upon startup, Flyway scripts seed the database with test accounts. Use the following credentials to explore the app:

- **Admin Account**: `admin@technest.com` / `admin123`
- **Customer Account**: `customer@technest.com` / `customer123`

*(Note: These accounts are pre-verified. Newly registered accounts require email verification.)*

---

## Database Migrations (Flyway)

Database schema versioning and initial catalog population are managed via Flyway. The project includes migrations from `V1` to `V11`, handling:
- Baseline schema creation (Users, Products, Orders, Categories).
- Indexing for performance and concurrency locks.
- Seed data for products, categories, and verified users.
- Guest checkout support (`guest_token` and `guest_email`).
- OAuth2 structural updates (e.g., nullable passwords).
- Reset password token columns.

---

## Running Tests & CI

### Backend Tests
```bash
cd backend
./mvnw clean test
```

### Frontend Lint & Build
```bash
cd frontend
npm run lint
npm run build
```

Automated CI is configured via GitHub Actions in `.github/workflows/ci.yml`.

---

## Original Repositories

This monorepo was consolidated from:
- **Frontend**: https://github.com/Dhanushkamg/technest-frontend
- **Backend**: https://github.com/Dhanushkamg/technest-backend

Complete Git history from both repositories has been preserved.
