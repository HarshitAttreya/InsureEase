#!/usr/bin/env bash

echo "==================================================="
echo "  InsureEase: InsureGroup Management Platform"
echo "  Launching Backend (SpringBoot) & Frontend (React)"
echo "==================================================="

# Start backend
cd backend
chmod +x mvnw
./mvnw spring-boot:run &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Servers launched in background."
echo "- React Web App:    http://localhost:3000"
echo "- Backend REST API: http://localhost:8080/api/dashboard/summary"
echo "- H2 DB Console:    http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:insureease, User: sa, Password: [empty])"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
