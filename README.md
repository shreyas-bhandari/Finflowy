<div align="center">

  <img alt="FinSight-AI Hero Banner" src="./assets/finsight_banner.png" width="100%" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"/>

  <h1>🌍 FinSight AI — Intelligent Personal Finance Tracker</h1>

  <p><em>“Not just tracking money — understanding it.”</em></p>

  <p><strong>AI-powered financial intelligence system with predictive analytics, behavioral insights, and real-time visualization.</strong></p>

  <p>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#architecture"><strong>Architecture</strong></a> ·
    <a href="#getting-started"><strong>Quick Start</strong></a>
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react" />
    <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" />
    <img src="https://img.shields.io/badge/Python-ML_Service-yellow?style=for-the-badge&logo=python" />
    <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker" />
    <img src="https://img.shields.io/badge/Microservices-Architecture-orange?style=for-the-badge&logo=docker" />
  </p>

  <img src="./Frontend/src/assets/hero.png" alt="Dashboard Preview" width="100%" style="border-radius: 10px; margin-top: 20px;" />

</div>

---

## 🌟 Overview

**FinSight AI** is an advanced AI-powered personal finance intelligence system built using the MERN stack, Python ML microservices, and Docker.

It goes beyond traditional finance trackers by:
- Analyzing user spending behavior  
- Predicting future financial trends  
- Generating intelligent insights  
- Calculating a financial health score  

---

## 🚀 Features

- 📊 **Interactive Dashboard** with real-time financial visualization  
- 🧠 **AI-Based Insights** for smarter financial decisions  
- 📈 **Predictive Analytics** (future balance, trends)  
- 🎯 **Goal-Based Planning** with progress tracking  
- 💰 **Expense & Income Management**  
- ⚠️ **Anomaly Detection** for unusual spending  
- 🧬 **Behavioral Analysis** of spending habits  
- 🐳 **Fully Dockerized Microservices Architecture**  

---

## 🛠️ Technology Stack

### Frontend (`Frontend/`)
- React + TypeScript (Vite)
- Tailwind CSS
- Recharts (data visualization)
- Framer Motion (animations)

### Backend (`Backend/`)
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- REST API architecture

### ML Service (`ML_Service/`)
- Python (FastAPI / Flask)
- Scikit-learn
- Pandas, NumPy

---

## 🏗️ Architecture

```mermaid
graph TD
    Client[React Frontend] -->|API Calls| Backend[Node.js API]
    Backend -->|Database Ops| DB[(MongoDB)]
    Backend -->|ML Requests| ML[Python ML Service]
    ML -->|Predictions| Backend
