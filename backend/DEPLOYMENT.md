# InsureEase Deployment & Operation Guide

This guide covers everything you need to run, test, containerize, and deploy the **InsureEase: InsureGroup Management Platform** across local development environments and cloud production platforms.

---

## 1. Architecture Overview

- **Frontend**: React 19 + Vite 8 + Tailwind CSS + Lucide Icons (Single Page App on port `3000`)
- **Backend**: Spring Boot 4.1 + Spring Data JPA + Hibernate + Java 21 (REST API on port `8080`)
- **Database**: H2 In-Memory Database (`jdbc:h2:mem:insureease`) with Web Console enabled (`/h2-console`)
- **Preloaded Seed Data**: Auto-populated upon first start with realistic corporate organizations, group policies (Health, Life, Accident, Dental), employee census members, underwriting cases, renewal records, claims, and invoices.

---

## 2. Option A: Quick Local Start (No Docker Required)

### Prerequisites:
- Java JDK 21+ (`java -version`)
- Node.js 18+ & npm (`node -v`, `npm -v`)

### On Windows:
Double-click `start-all.bat` or run in terminal:
```cmd
.\start-all.bat
```

### On macOS / Linux:
```bash
chmod +x start-all.sh
./start-all.sh
```

### Running Manually in Two Terminals:

#### Terminal 1 — Spring Boot Backend:
```bash
cd backend
# On Windows:
.\mvnw.cmd spring-boot:run
# On Linux/macOS:
chmod +x mvnw && ./mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.

#### Terminal 2 — React Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## 3. Option B: Docker Compose Deployment

Both frontend and backend are fully containerized using multi-stage Dockerfiles.

### Build & Run Containers:
```bash
docker-compose up -d --build
```

### Verify Running Containers:
```bash
docker-compose ps
```

### Stop Containers:
```bash
docker-compose down
```

### Container Endpoints:
- **Web Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api/dashboard/summary`
- **H2 Console**: `http://localhost:8080/h2-console`

---

## 4. H2 In-Memory Database Access

The application runs an embedded H2 database with Web Console enabled.

1. Open your browser to: `http://localhost:8080/h2-console`
2. Enter connection credentials:
   - **Saved Settings**: Generic H2 (Embedded)
   - **Driver Class**: `org.h2.Driver`
   - **JDBC URL**: `jdbc:h2:mem:insureease`
   - **User Name**: `sa`
   - **Password**: *(leave blank)*
3. Click **Connect** to query database tables:
   - `ORGANIZATIONS`
   - `GROUP_POLICIES`
   - `CENSUS_MEMBERS`
   - `UNDERWRITING_ASSESSMENTS`
   - `RENEWAL_QUOTES`
   - `INSURANCE_CLAIMS`
   - `BILLING_INVOICES`

---

## 5. Cloud Platform Deployments

### A. Render (render.com)
1. **Backend**:
   - Create a **Web Service** pointing to your repository `backend` subfolder.
   - Environment: `Docker` or `Java`
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/insureease-backend-0.0.1-SNAPSHOT.jar`
   - Set Port: `8080`
2. **Frontend**:
   - Create a **Static Site** pointing to `frontend`.
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add rewrite rule: `/* -> /index.html` (for SPA routing).

### B. Railway (railway.app)
1. Link your GitHub repository to Railway.
2. Railway detects Dockerfiles automatically for both services (`backend` and `frontend`).
3. Set the frontend environment variable `VITE_API_URL` to point to the backend public domain.

### C. AWS (Elastic Beanstalk / ECS)
- For **AWS ECS (Fargate)**:
  1. Build and push `backend` and `frontend` Docker images to Amazon ECR.
  2. Create an ECS Task Definition with both container definitions.
  3. Deploy behind an Application Load Balancer (ALB).

### D. Production Database Migration (PostgreSQL / MySQL)
If you wish to switch from H2 to PostgreSQL for permanent cloud persistence, update `backend/src/main/resources/application.properties`:
```properties
# Replace H2 with PostgreSQL
spring.datasource.url=jdbc:postgresql://your-db-host:5432/insureease
spring.datasource.username=postgres_user
spring.datasource.password=your_secure_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```
Add the `postgresql` driver dependency to `backend/pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## 6. One-Click Demo Reset
Whenever you want to reset the demonstration database back to default sample corporate accounts, click **Reset Demo Data** in the top navbar or call:
```bash
curl -X POST http://localhost:8080/api/seed/reset
```
