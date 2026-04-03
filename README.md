<div align="center">

  <h1>🌍 FinSight AI - Intelligent Personal Finance Tracker</h1>
  <p><em>“Not just tracking money — understanding it.”</em></p>
  <p><strong>Experience the next generation of financial tracking with predictive ML insights, dynamic goal allocation, and real-time visualization.</strong></p>
  
  <p>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#architecture"><strong>Architecture</strong></a> ·
    <a href="#quick-start-docker"><strong>Quick Start</strong></a> ·
    <a href="#manual-setup"><strong>Manual Setup</strong></a>
  </p>
=======
  <img alt="FinSight-AI Hero Banner" src="./assets/finsight_banner.png" width="100%" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"/>
  <h1>✨ FinSight-AI ✨</h1>
  <p>A next-generation, AI-powered Personal Finance Intelligence System designed to empower users with predictive analytics, transaction management, and intelligent goal tracking.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" alt="Node JS">
    <img src="https://img.shields.io/badge/Python-ML_Service-yellow?style=for-the-badge&logo=python" alt="Python">
    <img src="https://img.shields.io/badge/Microservices-Architecture-orange?style=for-the-badge&logo=docker" alt="Microservices">
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker">
  </p>


---

<div align="center"> 

  <img alt="FinSight-AI Hero Banner" src="./assets/finsight_banner.png" width="100%" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"/>

  <h1>🌍 FinSight AI - Intelligent Personal Finance Tracker</h1>
  <p><em>“Not just tracking money — understanding it.”</em></p>

  <p><strong>Experience the next generation of financial tracking with predictive ML insights, dynamic goal allocation, and real-time visualization.</strong></p>

  <p>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#architecture"><strong>Architecture</strong></a> ·
    <a href="#quick-start-docker"><strong>Quick Start</strong></a> ·
    <a href="#manual-setup"><strong>Manual Setup</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" alt="Node JS">
    <img src="https://img.shields.io/badge/Python-ML_Service-yellow?style=for-the-badge&logo=python" alt="Python">
    <img src="https://img.shields.io/badge/Microservices-Architecture-orange?style=for-the-badge&logo=docker" alt="Microservices">
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker">
  </p>

  <img src="./Frontend/src/assets/hero.png" alt="FinSight AI Dashboard Preview" width="100%" style="border-radius: 10px; margin-top: 20px;" />

</div>

---

## 🌟 Overview

Welcome to **FinSight-AI**, a premier financial intelligence suite. This project is built on a scalable microservice architecture bringing together a lightning-fast React frontend, a robust Node.js backend, and a dedicated Python Machine Learning service. It is designed to track income, categorize expenses seamlessly, and deliver proactive financial insights based on user behavior patterns.

---

## 🚀 Key Features

* **AI Predictive Analytics:** A dedicated Python microservice driving behavioral analysis and spending forecasts.
* **Comprehensive Dashboard:** An interactive, dark-mode glassmorphism UI built for deep financial visualization.
* **Intelligent Goal Tracking:** Priority-based savings allocation and dynamic goal adjustment models.
* **Transaction Management:** Seamless logging, deep categorization, and secure RESTful transaction handlers.
* **Fully Containerized Environment:** Effortless deployment using Docker and orchestrating multiple distinct services.

---

## 🛠️ Technology Stack

An enterprise-grade selection of technologies architected for performance and data science capabilities:

### Frontend Ecosystem (`Frontend/`)

* **Framework:** React in TypeScript
* **State & Routing:** Context APIs & React Router
* **Styling:** Tailwind CSS with deep glassmorphism UI aesthetics

### Core API Server (`Backend/`)

* **Runtime:** Node.js + Express
* **Database Management:** Deeply structured MongoDB interactions
* **Security:** Secured JWT Authentication mechanisms

### Machine Learning Hub (`ML_Service/`)

* **Environment:** Python
* **Capabilities:** Predictive analytics and predictive modeling pipelines

---

## 🏗️ Technical Architecture

FinSight AI is designed using a modern, containerized microservices architecture to ensure scalability, separation of concerns, and robust performance.

### ⚙️ High-Level Diagram

```mermaid
graph TD
    Client([Client Browser])
    Proxy[NGINX Reverse Proxy\nDocker Gateway]
    
    subgraph Frontend Subsystem
        React[React 19 Frontend UI\nVite + TailwindCSS]
    end
    
    subgraph Backend Subsystem
        NodeAPI[Node.js + Express Backend\nCore API Gateway]
    end
    
    subgraph AI/ML Subsystem
        MLService[Python Flask ML Service\nAnalytics & Predictions]
    end

    subgraph Data Persistence
        Mongo[(MongoDB Database)]
    end

    Client -->|HTTP/HTTPS| Proxy
    Proxy -->|Route: /| React
    Proxy -->|Route: /api| NodeAPI
    NodeAPI -->|REST| MLService
    NodeAPI -->|Mongoose| Mongo
```

---

### 🧩 Core Components

1. **Frontend UI (React 19 + TypeScript)**

   * Vite for fast builds
   * TailwindCSS styling
   * Handles dashboards, charts, auth

2. **Backend API (Node.js + Express.js)**

   * Controller-Service-Model pattern
   * JWT Authentication
   * CRUD + ML integration

3. **Machine Learning Microservice (Python + Flask)**

   * Prediction APIs
   * Behavioral analysis
   * Returns smart insights

4. **Database Layer (MongoDB)**

   * Stores Users, Transactions, Goals
   * Mongoose schemas

5. **Deployment (Docker)**

   * Multi-container orchestration
   * NGINX routing

---

### 📂 Directory Structure

```text
FinSight-AI/
├── Backend/
│   ├── models/
│   ├── routes/
│   └── controllers/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
├── ML_Service/
│   ├── app.py
│   └── predictor.py
├── docker-compose.yml
└── README.md
```

---

## 🏗️ System Architecture (Simplified)

```mermaid
graph TD;
    Client[💻 React Frontend Dashboard] -->|REST API Calls| Gateway[⚙️ Node.js API Backend];
    Gateway -->|Data Persistence| DB[(🗄️ Database)];
    Gateway -->|Predictive Data Requests| ML[🧠 Python ML Service];
    ML -->|Insights| Gateway;
```

---

## 📂 System Topology

```text
📦 FinSight-AI
 ┣ 📂 Frontend
 ┃ ┣ 📂 src/pages
 ┃ ┗ 📂 src/components
 ┣ 📂 Backend
 ┣ 📂 ML_Service
 ┗ 📜 docker-compose.yml
```

---

## 🚦 Getting Started (Docker Compose)

```bash
git clone https://github.com/shreyas-bhandari/FinSight-AI.git
cd FinSight-AI
docker-compose up -d --build
```

> Stop using: `docker-compose down`

---

<div align="center">
  <b>Architected for the future of decentralized algorithmic finance.</b>
</div>
