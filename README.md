# TechNest — Full-Stack E-Commerce Application

TechNest is a full-stack e-commerce application built with a React frontend and a Spring Boot backend. It supports product browsing, cart management, wishlist, order placement, payment processing (including PayHere sandbox integration), user authentication, admin management, and more.

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
| Spring Boot 4.1 | Application framework |
| Java 21 | Language |
| Spring Security | Authentication & authorization |
| Spring Data JPA + Hibernate | ORM & database access |
| PostgreSQL | Relational database |
| JJWT 0.13 | JWT token generation & validation |
| SpringDoc OpenAPI 2.8 | Swagger UI API documentation |
| Maven | Build tool |

---

## Features

- **Authentication** — JWT-based login and registration (customer & admin roles)
- **Product Catalog** — Browse, search, and filter products by category
- **Shopping Cart** — Add, update, and remove items
- **Wishlist** — Save products for later
- **Product Reviews & Ratings** — Submit and view reviews per product
- **Checkout & Orders** — Place orders with address selection and coupon codes
- **Payment Processing** — Simulated COD, card, and PayPal flows; PayHere payment gateway (sandbox)
- **Order Management** — Track order status; cancel orders with refund flow
- **Notifications** — In-app notifications for order and payment events
- **Admin Dashboard** — Manage products, categories, orders, coupons, and stock; view analytics
- **API Documentation** — Swagger UI at `/swagger-ui.html`

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

2. **Configure environment variables** — create `backend/.env` (gitignored):
```properties
PAYHERE_MERCHANT_ID=<your-sandbox-merchant-id>
PAYHERE_MERCHANT_SECRET=<your-sandbox-merchant-secret>
PAYHERE_NOTIFY_URL=<publicly-reachable-notify-url>
```

   > For local dev, expose port 8080 with ngrok: `ngrok http 8080`
   > Then set `PAYHERE_NOTIFY_URL=https://<tunnel>.ngrok-free.app/api/payments/payhere/notify`

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
VITE_API_BASE_URL=http://localhost:8080/api
```

3. **Run the dev server:**
```bash
npm run dev
```

   App: http://localhost:5173

---

## Important Environment Variables

| Variable | Location | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `frontend/.env` | Backend API base URL |
| `PAYHERE_MERCHANT_ID` | `backend/.env` | PayHere sandbox merchant ID |
| `PAYHERE_MERCHANT_SECRET` | `backend/.env` | PayHere merchant secret — never commit |
| `PAYHERE_NOTIFY_URL` | `backend/.env` | Public PayHere notify webhook URL |
| `PAYHERE_CURRENCY` | `backend/.env` | Payment currency (default: LKR) |
| `PAYHERE_RETURN_URL` | `backend/.env` | Redirect after successful payment |
| `PAYHERE_CANCEL_URL` | `backend/.env` | Redirect if payment is cancelled |

> WARNING: Never commit .env files containing real credentials to version control.

---

## Database Migrations (Flyway)

Database schema versioning and initial catalog population are managed via Flyway:
- `V1__init_schema.sql` — Baseline schema for all tables, constraints, foreign keys, and sequences.
- `V2__add_performance_indexes.sql` — Optimistic locking columns (`version`), deduplication keys, and composite performance query indexes.
- `V3__seed_catalog_data.sql` — Initial standard electronics categories and hardware products seed data.
- `V4__expand_catalog_population.sql` — Extended catalog population across all primary hardware departments (30+ products).

In production, Hibernate is configured to `validate` the schema against the entity model (`spring.jpa.hibernate.ddl-auto=validate`).

---

## Observability & Health

- **Correlation IDs**: Incoming `X-Request-ID` is sanitized and logged via SLF4J MDC, returned in response headers.
- **Actuator Health**: Safe liveness/readiness probes available at `/actuator/health` (internal environment and sensitive details are concealed).

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
