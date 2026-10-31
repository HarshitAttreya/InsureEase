# InsureEase: InsureGroup Management Platform

**InsureEase** is a full-featured B2B Group Insurance Policy Administration Platform designed for managing corporate insurance policies across 4 core operational pillars:
1. **Underwriting & Policy Administration** — Corporate census management, risk scoring, demographic analysis, plan tiering (Gold, Silver, Platinum), deductible/co-pay rule configurations.
2. **Renewals Desk** — Expiration tracking, historical loss ratio analysis (claims paid vs earned premium), automated experience-rated renewal pricing, quote generation, and policy period binding.
3. **Claims Intake & Adjudication** — Employee census claim submission, real-time deductible & co-pay calculation, adjudication workbench with approval/settlement/rejection flows, and live policy loss-ratio synchronization.
4. **Group Billing & Premium Invoicing** — Automated premium billing schedules (Monthly, Quarterly, Annual), invoice generation with taxes & fees, payment collection recording (Wire, ACH, Credit Card, Check), and receivables aging.

---

## Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide React
- **Backend**: Spring Boot 4.1 / Java 21, Spring Data JPA, Hibernate ORM
- **Database**: H2 Database (In-Memory embedded mode with Web Console at `/h2-console`)
- **Containerization**: Docker, Docker Compose, Nginx reverse proxy

---

## Project Structure

```
InsureEase/
├── backend/
│   ├── src/main/java/com/insureease/insureease_backend/
│   │   ├── config/             # CORS and Web configuration
│   │   ├── controller/         # REST Controllers (Policies, Underwriting, Renewals, Claims, Billing, Dashboard)
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── model/              # JPA Entities (Organization, GroupPolicy, CensusMember, Claims, Invoices, etc.)
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   └── service/            # Core business logic & Data Initialization Seeder
│   ├── src/main/resources/     # application.properties (H2 DB & Console configs)
│   ├── pom.xml                 # Maven dependencies
│   ├── mvnw / mvnw.cmd         # Maven Wrapper
│   └── Dockerfile              # Multi-stage backend container
├── frontend/
│   ├── src/
│   │   ├── components/         # React Views (Dashboard, Policies, Underwriting, Renewals, Claims, Billing, Navbar, Toast)
│   │   ├── services/api.js     # Centralized REST API client
│   │   ├── App.jsx             # Main application orchestrator
│   │   └── index.css           # Tailwind CSS styles
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite config with API proxy
│   ├── nginx.conf              # Production Nginx reverse proxy
│   └── Dockerfile              # Multi-stage frontend container
├── docker-compose.yml          # Containerized multi-service deployment
├── start-all.bat               # Windows 1-click launcher
├── start-all.sh                # Linux / macOS 1-click launcher
├── DEPLOYMENT.md               # Detailed deployment & cloud guide
└── README.md                   # Documentation
```

---

## Quick Start

### 1. Launch with Single Command (Local Dev)
- **Windows**: Double-click `start-all.bat`
- **Linux/macOS**: Run `./start-all.sh`

### 2. Launch with Docker Compose
```bash
docker-compose up -d --build
```

### Access URLs:
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api/dashboard/summary](http://localhost:8080/api/dashboard/summary)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:insureease`
  - User: `sa`
  - Password: *(leave blank)*

---

## Core Operational Modules

### 1. Executive Dashboard
- Portfolio Loss Ratio gauge (Healthy <65%, Watch 65-80%, Elevated >80%)
- Gross Written Premium (GWP) tracking & contracted annualized premium
- Total covered lives (census headcounts)
- High-priority operational queues (Pending underwriting, open claims, overdue receivables)

### 2. Group Policies & Census
- Browse and filter by product line (Health, Life, Accident, Dental, Disability)
- Plan tier customization (Basic, Silver, Gold, Platinum)
- Live member census roster: view employee dependents, age, relationship, and pre-existing condition flags
- 1-click member enrollment to policy census

### 3. Underwriting Hub
- Automated composite risk evaluation engine (analyzing census demographics, average employee age, and organization hazard multiplier)
- Underwriter decision workbench: `APPROVED`, `CONDITIONALLY_APPROVED`, or `DECLINED`
- Adjustable premium rate adjustment (% loading / discount) and special warranties

### 4. Renewals Desk
- Early warning system for policies expiring within 90 days
- Experience loss-ratio driven renewal pricing formula
- 1-click renewal binding: automatically extends policy term by 1 year, updates premium schedule, and resets loss ratio for new cycle

### 5. Claims Intake & Adjudication
- Registration of claims by policy and covered census member
- Automatic calculation preview for deductibles and co-pays based on policy parameters
- Adjudicator workbench to approve, reject, or settle with payment trace references
- Live loss ratio synchronization

### 6. Billing & Premium Invoicing
- Premium invoice generation based on policy billing cycles (Monthly, Quarterly, Annual)
- Calculation of state premium taxes & administrative fees
- Payment recording workbench (Wire Transfer, ACH, Credit Card, Check) with real-time balance reconciliation

---

## License
Proprietary & Confidential — InsureEase Platform.
