# Saagar Capital Finance

A full-stack digital banking platform built with **Spring Boot 3** and **React**. Features JWT authentication, account management, real-time fund transfers, downloadable statements, and a back-office console for customer and account oversight.

> Saagar Capital Finance is a demonstration banking platform built to showcase full-stack engineering practices. It is not a licensed bank or financial institution, and no real funds are held, transferred, or insured.

**Live Demo:** _Coming soon_
**Repo:** [github.com/jnthsgr/banking-app](https://github.com/jnthsgr/banking-app)

---

## What This Project Does

Saagar Capital Finance is a functional online banking application where customers can:

- Register and sign in securely with JWT-based authentication
- Open SAVINGS or CURRENT accounts
- Deposit and withdraw funds
- Transfer money instantly between any two accounts
- Browse paginated transaction history with reference numbers and running balances
- Download a CSV account statement for any account

Bank staff (role `ADMIN`) get a back-office console to:

- View every customer and account on the platform
- Freeze or unfreeze an account to stop it from transacting

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Backend Framework | Spring Boot 3.5 |
| Authentication | Spring Security + JWT |
| Authorization | Method-level security (`@PreAuthorize`, role-based) |
| Password Hashing | BCrypt |
| Concurrency Control | JPA optimistic locking (`@Version`) on account balances |
| ORM | JPA / Hibernate |
| Database | MySQL |
| Build Tool | Maven |
| Frontend | React 18 + Vite |
| HTTP Client | Axios |
| Routing | React Router DOM |
| Typography | Inter / Fraunces (Google Fonts) |

---

## Project Structure
```
banking-app/
├── banking-backend/                  # Spring Boot REST API
│   └── src/main/java/com/banking/
│       ├── controller/               # REST endpoints (HTTP layer)
│       ├── service/                  # Business logic
│       ├── repository/               # Database access (Spring Data JPA)
│       ├── entity/                   # JPA entities → MySQL tables
│       ├── dto/                      # Request / Response objects
│       ├── security/                 # JWT filter, token utility
│       ├── config/                   # Security + CORS configuration
│       └── exception/                # Typed exceptions + global handler
│
└── banking-frontend/                 # React UI
    └── src/
        ├── pages/                    # Landing, Login, Register, Dashboard, Admin...
        ├── components/               # Navbar, Footer, Logo, AccountCard, TransactionTable
        ├── services/                 # API call functions
        ├── context/                  # Auth context with JWT state
        └── utils/                    # Axios instance, formatCurrency, formatDate
```

---

## How Authentication Works

1. User registers → password is **BCrypt hashed** → saved to MySQL
2. User logs in → server validates password → returns a **signed JWT token**
3. Frontend stores the JWT → an **Axios interceptor** attaches it to every request automatically
4. Backend **JWT filter** validates the token and loads the user's role on every protected endpoint
5. Admin-only routes are enforced both at the security-filter layer and via `@PreAuthorize("hasRole('ADMIN')")` on the controller
6. Invalid or expired token → automatically redirected to login

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/accounts` | Yes | Open new account |
| GET | `/api/accounts` | Yes | Get my accounts |
| GET | `/api/accounts/{accountNumber}` | Yes | Get single account |
| POST | `/api/transactions/deposit` | Yes | Deposit funds |
| POST | `/api/transactions/withdraw` | Yes | Withdraw funds |
| POST | `/api/transactions/transfer` | Yes | Transfer to another account |
| GET | `/api/transactions/history/{accountNumber}` | Yes | Full transaction history |
| GET | `/api/transactions/history/{accountNumber}/page` | Yes | Paginated transaction history (`page`, `size`) |
| GET | `/api/transactions/statement/{accountNumber}` | Yes | Download a CSV statement |
| GET | `/api/admin/users` | Yes (ADMIN) | List all customers |
| GET | `/api/admin/accounts` | Yes (ADMIN) | List all accounts |
| PATCH | `/api/admin/accounts/{accountNumber}/freeze` | Yes (ADMIN) | Freeze an account |
| PATCH | `/api/admin/accounts/{accountNumber}/unfreeze` | Yes (ADMIN) | Unfreeze an account |

---

## Setup — Backend

### Prerequisites
- Java 17+
- MySQL 8+
- Maven

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/jnthsgr/banking-app.git
cd banking-app/banking-backend
```

**2. Create the database**
```sql
CREATE DATABASE saagar_capital_finance;
```

**3. Configure application properties**
```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Open `application.properties` and fill in:
```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
jwt.secret=YOUR_SECRET_KEY_MINIMUM_32_CHARACTERS
```

**4. Run the backend**
```bash
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`
Hibernate auto-creates all tables on first run. The first registered user is a `CUSTOMER`; promote a user to `ADMIN` directly in the `users` table to access the back office.

---

## Setup — Frontend

### Prerequisites
- Node.js 18+

### Steps
```bash
cd banking-app/banking-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Database Schema
```
users
├── id (PK)
├── full_name
├── email (UNIQUE)
├── password (BCrypt hashed)
├── phone_number (UNIQUE)
├── role (CUSTOMER / ADMIN)
├── is_active
├── created_at
└── updated_at

accounts
├── id (PK)
├── account_number (UNIQUE)
├── account_type (SAVINGS / CURRENT)
├── balance
├── status (ACTIVE / FROZEN)
├── version (optimistic lock)
├── user_id (FK → users)
├── created_at
└── updated_at

transactions
├── id (PK)
├── amount
├── transaction_type (DEPOSIT / WITHDRAWAL / TRANSFER_DEBIT / TRANSFER_CREDIT)
├── balance_after
├── description
├── reference_number
├── account_id (FK → accounts)
└── created_at
```

---

## Key Technical Decisions

**Why JWT over sessions?**
Stateless authentication scales better — no server-side session storage needed. Every request is self-contained.

**Why BCrypt?**
One-way hashing with a random salt — even identical passwords produce different hashes. Cannot be reversed.

**Why `@Transactional` on transfers?**
If debiting account A succeeds but crediting account B fails, the entire operation rolls back automatically. No money disappears.

**Why optimistic locking (`@Version`) on accounts?**
Two concurrent requests against the same account (e.g. a withdrawal racing a transfer) could otherwise both read the same starting balance and overwrite each other's update. Optimistic locking detects the conflict and fails one request with a `409 Conflict` instead of silently corrupting the balance.

**Why typed exceptions instead of generic `RuntimeException`?**
`ResourceNotFoundException`, `InsufficientFundsException`, `AccountFrozenException`, etc. map to precise HTTP status codes (404, 422, 409...) through a single global exception handler, so API consumers get a consistent, predictable error contract instead of everything collapsing to `400 Bad Request`.

**Why DTOs instead of exposing entities?**
Prevents leaking internal fields like hashed passwords, controls exactly what the API exposes, and decouples the database schema from the API contract.

---
