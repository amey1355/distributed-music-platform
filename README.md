# 🎵 Distributed Music Platform

[![CI - Build & Test](https://github.com/amey1355/distributed-music-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/amey1355/distributed-music-platform/actions)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-blue?logo=typescript)
![Redis](https://img.shields.io/badge/Redis-Enabled-red?logo=redis)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Event%20Driven-orange?logo=rabbitmq)
![License](https://img.shields.io/badge/License-Proprietary-black)

> 🚀 A **microservice-based music streaming platform** built with **Node.js, TypeScript, RabbitMQ, Redis, and Docker** — designed for scalable, event-driven service communication and distributed processing.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture Overview](#️-architecture-overview)
- [Core Features](#️-core-features)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Deployment](#️-deployment)
- [CI/CD Pipeline](#️-continuous-integration-github-actions)
- [Architecture Diagram](#️-architecture-diagram)
- [Preview](#-preview)
- [License](#-license)
- [Author](#-author)

---

## 🧩 Tech Stack

**Backend**
- Node.js, Express.js, TypeScript  
- PostgreSQL, MongoDB  
- Redis (Caching Layer), RabbitMQ (Message Broker)  
- Cloudinary (Media Storage)

**Frontend**
- React (Vite), TailwindCSS  
- Deployed on Netlify / Vercel

**Infrastructure**
- Docker, Docker Compose  
- GitHub Actions (CI/CD)  
- AWS ECS (for auto-deployments)

---

## 🏗️ Architecture Overview

Each service runs independently and communicates via **RabbitMQ events** or **REST APIs** within a Docker network.

### Services Overview

| Service | Port | Role |
|----------|------|------|
| **Admin Service** | `7000` | Handles admin operations, uploads, album & song management |
| **User Service** | `5000` | Manages user registration, authentication, and playlists |
| **Song Service** | `8000` | Handles song retrieval, album data, and caching |
| **Worker Service** | — | Processes background tasks (notifications, metadata, indexing) |
| **Client (React)** | `3000` | Web UI for streaming and playlist interaction |
| **Redis** | `6379` | Caching and session layer |
| **RabbitMQ** | `5672 / 15672` | Message queue & dashboard |

---

## ⚙️ Core Features

- 🧩 **Distributed Microservice Architecture** – Modular, scalable, fault-tolerant
- ⚡ **Event-Driven Messaging with RabbitMQ** – Async background processing
- 🚀 **Smart Redis Caching Layer** – Reduces redundant DB hits by ~70%
- 🗄️ **Polyglot Persistence** – PostgreSQL (songs/albums), MongoDB (users/auth)
- 🔐 **JWT Authentication** – Secure access control for users/admins
- ☁️ **Cloudinary Integration** – Cloud-based media storage and delivery
- 🐳 **Docker Orchestration** – Unified multi-service management
- 🤖 **GitHub Actions CI** – Automated build, lint, and type-check pipelines

---

## 📁 Project Structure
```
distributed-music-platform/
├── client/                    # React (Vite) frontend
├── services/
│   ├── admin-service/        # Admin microservice
│   ├── user-service/         # User microservice
│   ├── song-service/         # Song microservice
│   └── worker-service/       # RabbitMQ consumer
├── docker-compose.yml         # Docker orchestration config
└── README.md
```

---

## 🧱 Setup Instructions

> ⚠️ **Note:** This project is for portfolio and demonstration purposes only.  
> Please **do not clone, redistribute, or reuse** without permission.

### 🧠 Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Redis (Cloud or Local)
- [Cloudinary](https://cloudinary.com/) account (for media uploads)
- PostgreSQL + MongoDB instances

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/amey1355/distributed-music-platform.git
cd distributed-music-platform
```

### 2️⃣ Configure Environment Variables

Create `.env` files for each service in `services/*/.env`:
```env
PORT=7000
DATABASE_URL=your_database_url
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
CLOUDINARY_URL=cloudinary://<key>:<secret>@<name>
JWT_SECRET=your_secret
```

> 💡 **Tip:** Copy `.env.example` to `.env` if provided in each service directory.

### 3️⃣ Build and Run All Containers
```bash
docker compose up --build
```

**When running:**
- 🌐 Frontend → [http://localhost:3000](http://localhost:3000)
- 🐰 RabbitMQ UI → [http://localhost:15672](http://localhost:15672)  
  (username: `admin`, password: `admin123`)

### 4️⃣ Verify Services

Check all containers are running:
```bash
docker compose ps
```

You should see all services in a healthy state.

---

## ☁️ Deployment

### 🧱 Backend on AWS ECS or Render

1. Push Docker images to ECR or Render registry:
```bash
   docker tag  /:latest
   docker push /:latest
```

2. Deploy each microservice as a container
3. Set environment variables via ECS task definitions or Render dashboard

### 💻 Frontend on Netlify / Vercel

1. Build static assets:
```bash
   cd client
   npm install
   npm run build
```

2. Deploy the `/dist` directory to Netlify or Vercel

3. Set environment variable:
```env
   VITE_API_URL=https://your-deployed-api-url/api/v1
```

---

## ⚙️ Continuous Integration (GitHub Actions)

This repo includes a CI workflow that:
- ✅ Builds all microservices in isolation
- ✅ Runs lint and TypeScript checks
- ✅ Validates Docker image integrity

**File path:**
```
.github/workflows/ci.yml
```

View the [latest CI runs](https://github.com/amey1355/distributed-music-platform/actions) on GitHub Actions.

---

## 🗺️ System Architecture

Below is the complete architecture of the **Distributed Music Platform**:

![Architecture Diagram](./client/public/architecture-diagram.png)

> The platform uses a microservice architecture orchestrated via Docker Compose, 
> supporting REST APIs and event-driven workflows with RabbitMQ. 
> Redis ensures low-latency caching, while Cloudinary and PostgreSQL handle 
> media and relational data storage respectively.

---

## 📸 Preview

![Output](./client/public/test-output.png)

---

## 🤝 Contributing

This is a portfolio project and is not open for contributions. However, if you have suggestions or find issues, feel free to [open an issue](https://github.com/amey1355/distributed-music-platform/issues).

---

## 📜 License

This project is **proprietary** — no reuse, redistribution, or public hosting without explicit permission.

---

## 👨‍💻 Author

**Amey Sawant** [@amey1355](https://github.com/amey1355)

💼 Distributed Systems | Cloud | Node.js | TypeScript | DevOps

📧 For collaborations or hiring inquiries, please reach out via [GitHub](https://github.com/amey1355) or [LinkedIn](https://www.linkedin.com/in/ameysawant1355/).

---

## 🙏 Acknowledgments

Special thanks to the open-source community for the amazing tools and libraries that made this project possible.

---

⭐ **If you like this project, consider starring the repository!**

---

<div align="center">
Made with ❤️ by Amey Sawant
</div>
