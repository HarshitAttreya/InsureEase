@echo off
echo ===================================================
echo   InsureEase: InsureGroup Management Platform
echo   Launching Backend (SpringBoot) & Frontend (React)
echo ===================================================

echo [1/2] Starting Spring Boot Backend on port 8080...
start "InsureEase Backend (Spring Boot)" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo [2/2] Starting React Frontend on port 3000...
start "InsureEase Frontend (React)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo - React Web App:    http://localhost:3000
echo - Backend REST API: http://localhost:8080/api/dashboard/summary
echo - H2 Database:      http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:insureease, User: sa, Password: [empty])
echo.
pause
