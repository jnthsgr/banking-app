# 🏦 Banking Application

A full-stack banking system built with **Spring Boot 3** and **React**. Features JWT authentication, account management, and real-time fund transfers with full transaction history.

🔗 **Live Demo:** _Coming soon_  
📁 **Repo:** [github.com/jnthsgr/banking-app](https://github.com/jnthsgr/banking-app)

---

## 📌 What This Project Does

This is a functional banking application where users can:

- Register and log in securely with JWT tokens
- Open SAVINGS or CURRENT bank accounts
- Deposit and withdraw funds
- Transfer money between any two accounts
- View complete transaction history with reference numbers and balance snapshots

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Backend Framework | Spring Boot 3.5 |
| Authentication | Spring Security + JWT |
| Password Hashing | BCrypt |
| ORM | JPA / Hibernate |
| Database | MySQL |
| Build Tool | Maven |
| Frontend | React 18 + Vite |
| HTTP Client | Axios |
| Routing | React Router DOM |

---

## 🗂️ Project Structure
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
│       └── exception/                # Global exception handler
│
└── banking-frontend/                 # React UI
    └── src/
        ├── pages/                    # Login, Register, Dashboard, Transfer...
        ├── components/               # Navbar, AccountCard, TransactionTable
        ├── services/                 # API call functions
        ├── context/                  # Auth context with JWT state
        └── utils/                    # Axios instance, formatCurrency
```

---

## 🔐 How Authentication Works

1. User registers → password is **BCrypt hashed** → saved to MySQL
2. User logs in → server validates password → returns a **signed JWT token**
3. Frontend stores JWT → **Axios interceptor** attaches it to every request automatically
4. Backend **JWT filter** validates the token on every protected endpoint
5. Invalid or expired token → automatically redirected to login

---

## 🌐 API Endpoints

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
| GET | `/api/transactions/history/{accountNumber}` | Yes | Transaction history |

---

## ⚙️ Setup — Backend

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
CREATE DATABASE banking_db;
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
Hibernate auto-creates all tables on first run.

---

## ⚙️ Setup — Frontend

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

## 📊 Database Schema
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

## 🔑 Key Technical Decisions

**Why JWT over sessions?**  
Stateless authentication scales better — no server-side session storage needed. Every request is self-contained.

**Why BCrypt?**  
One-way hashing with a random salt — even identical passwords produce different hashes. Cannot be reversed.

**Why @Transactional on transfers?**  
If debiting account A succeeds but crediting account B fails, the entire operation rolls back automatically. No money disappears.

**Why DTOs instead of exposing entities?**  
Prevents leaking internal fields like hashed passwords, controls exactly what the API exposes, and decouples the database schema from the API contract.

---

## 📄 License

MIT License — free to use for learning and portfolio purposes.
```

---
