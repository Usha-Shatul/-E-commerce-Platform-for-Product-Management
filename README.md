# 🛍️ Full-Stack E-commerce Application

## 📌 Overview

This project is a full-featured e-commerce website built using modern backend and frontend technologies. It supports core functionalities like product management, user authentication, cart and order management, secure payments, and more.

---

## 🎯 Core Features

- User Authentication (JWT)
- Product Listing & Filtering
- Product Categories
- Cart Management
- Checkout & Order Placement
- Stripe Payment Gateway Integration
- Responsive Frontend (React)
- Secure Backend (Spring Boot)
- CI/CD Pipeline




#### Run Backend

```bash
cd backend
mvn spring-boot:run
```

---

### Frontend Setup

#### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

#### Environment Variables
Copy the example file and fill in values:
```bash
cp frontend/.env.example frontend/.env
```
Main variables:
- `REACT_APP_API_URL`
- (others as required)

#### Run Frontend

```bash
cd frontend
npm install
npm start
```
App will run at `http://localhost:3000`.

---

## 🐳 Docker Setup (Recommended)

You can run the entire stack using Docker and Docker Compose:

```bash
docker-compose up --build
```

This will start frontend, backend, and the database containers. Update environment variables as needed in the respective `.env` files or in `docker-compose.yml`.

---

## 🧪 Running Tests

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm test
```

---

## ☁️ Deployment

The project is ready to deploy on AWS using EC2, S3 (for static assets), and RDS (for the database). Docker images can be pushed to ECR for production. CI/CD is set up with GitHub Actions.

---

## 🗂️ Project Structure

```
fullstack-ecommerce/
├── backend/         # Spring Boot application
├── frontend/        # React application
├── docker-compose.yml
└── README.md


