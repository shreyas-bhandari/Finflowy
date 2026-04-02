<div align="center">
  <img src="https://img.icons8.com/color/150/000000/activity.png" alt="FinSight AI Logo" width="100"/>
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
    <img src="https://img.shields.io/badge/Node.js-Backend-green.svg?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-Frontend-blue.svg?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Python-ML%20Service-yellow.svg?style=for-the-badge&logo=python" alt="Python" />
    <img src="https://img.shields.io/badge/Docker-Containerized-2496ED.svg?style=for-the-badge&logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  </p>
</div>

---

## ✨ Features
FinSight AI isn't just a budget planner—it is an intelligent system adapting to your financial behavior.
- 🧠 **Predictive Financial Insights**: Python-powered ML service analyzing transaction history for future trend forecasting.
- 🎯 **Priority-Based Dynamic Goal Tracking**: Algorithmic income distribution based on goal priority and urgency.
- 💳 **Complete Transaction Management**: Log, categorize, and update income and expenses instantly.
- 📊 **Real-time Analytics Dashboard**: Interactive charts (`recharts`), automated summaries, and elegant UI.
- 🔒 **Secure Authentication**: JWT-based secure user sessions and password hashing for ultimate privacy.
- 🐳 **1-Click Containerized Setup**: A robust Production-grade Docker setup out of the box!

---

## 🏗️ System Architecture
Built as a highly scalable microservice application.
1. **Frontend**: *React 19 + TypeScript + Vite + TailwindCSS* (Beautiful, ultra-responsive UI)
2. **Backend**: *Node.js + Express.js* (Handles user routing, authentications, CRUD operations)
3. **ML Service**: *Python + Flask* (Processes AI predictions and behavior analytics)
4. **Database**: *MongoDB* (Persistent data layer)
5. **Gateway & Delivery**: NGINX routing via *Docker Compose*

---

## 🚀 Quick Start (Docker)
The easiest way to get FinSight AI running locally in less than 2 minutes!

**Prerequisites:** You must have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shreyas-bhandari/FinSight-AI.git
   cd FinSight-AI
   ```
2. **Launch with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   *That's it!* Docker will build the Frontend UI, start the Node Backend, provision the ML Microservice, and spin up a MongoDB instance automatically on an isolated internal bridge network.
   
3. **Access the App**
   - Head over to `http://localhost:80` in your web browser. 
   - Backend API runs at `http://localhost:5000`
   - ML Microservice API runs at `http://localhost:5001`

---

## 🛠️ Manual Setup (Development Mode)
If you wish to run the individual services locally for development:

**Prerequisite:** Make sure you have **Node.js**, **Python 3.x**, and a local running instance of **MongoDB** (or a MongoDB Atlas URI string).

### 1. Database Setup
Ensure MongoDB is running locally on `mongodb://localhost:27017` or provide your own `.env` configuration in the Backend directory.

### 2. Backend (Node.js API)
```bash
cd Backend
npm install
# Set your environment variables (PORT, MONGO_URI, JWT_SECRET, ML_API_URL)
npm run dev
```

### 3. ML Service (Python)
```bash
cd ML_Service
pip install -r requirements.txt
python app.py
```

### 4. Frontend (React / Vite)
```bash
cd Frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the frontend natively.

---

## 📜 Environment variables reference
For the backend API to function correctly, make sure these env variables are accessible:
- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/finance_tracker` (Change if not running via Docker)
- `ML_API_URL=http://localhost:5001/api/ml`
- `JWT_SECRET=super_secret_jwt_signature_key`

---

## 🤝 Contribution
Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/shreyas-bhandari/FinSight-AI/issues).

<div align="center">
  <sub>Built with ❤️ by tech enthusiasts for financial freedom.</sub>
</div>
