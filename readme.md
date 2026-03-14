# VARNA - Online Marketplace for Artisans to Sell Handmade Goods

Varna is a premium, high-fidelity e-commerce ecosystem designed to empower grassroots artisans and weavers. It bridges the gap between traditional craftsmanship and modern retail through blockchain-verified authenticity, NGO-supported logistics, and a sharp, minimalist interface.

---

## 🌟 Core Features

### 1. Artisan Empowerment
- **Professional Studio**: Artisans manage their own digital storefront with custom bios, store names, and craft histories.
- **Micro-Marketing**: Independent coupon generation for targeted sales and community engagement.
- **Financial Logistics**: Dedicated sections for banking and UPI protocols to ensure seamless settlements.

### 2. Product Authenticity (Blockchain Integration)
- **NFT Minting**: Premium products can be minted as unique authenticity tokens on the blockchain.
- **Smart Verification**: Consumers can verify product origin via unique transaction hashes and ledger records.
- **Anti-Counterfeit**: Immutable proof of ownership and craft origin.

### 3. Customer Acquisition & Experience
- **Citizen Intelligence**: High-fidelity review system with sentiment analysis badges for public feedback.
- **Dynamic Acquisitions**: Real-time order tracking and historical log of authenticated purchases.
- **Premium Interface**: Minimalist, high-contrast design system optimized for a luxury retail experience.

### 4. AI Assistance (Powered by Groq)
- **Cultural Notes Generation**: Automatically generates insightful cultural narratives for artisan products using advanced LLMs.
- **Smart Improvements**: Suggests actionable feedback to craftsmen based on image analysis and product descriptions.
- **High-Speed Inference**: Powered by Groq's low-latency API to deliver instant AI generation without blocking the primary Node thread.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18.0+)
- **PostgreSQL** (v14+)
- **NPM** or **Yarn**

### Step 1: Clone the Repository
```bash
git clone https://github.com/nithinprasath21/varna.git
cd varna
```

OR for latest:

```bash
git clone https://github.com/praneshjuly47/varna.git
cd varna
```

### Step 2: Database Initialization (PostgreSQL)

**Windows (PowerShell/CMD):**
1. Create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE varna_db;"
   ```
2. Build the unified schema:
   ```bash
   psql -U postgres -d varna_db -f server/db/schema.sql
   ```

**Mac / Linux:**
1. Create the database:
   ```bash
   createdb varna_db
   ```
2. Build the unified schema:
   ```bash
   psql -d varna_db -f server/db/schema.sql
   ```

> **Maintenance**: To reset the database to a fresh state (delete all data and tables):
> ```bash
> psql -d varna_db -f server/db/teardown.sql
> psql -d varna_db -f server/db/schema.sql
> ```

---

---

### Step 3: Backend Configuration (Server)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the `server` directory:
   - **Recommended**: Copy the example file:
     ```bash
     cp .env.example .env
     ```
   - Then edit the `.env` file with your specific credentials:
     ```env
     PORT=5000
     DEV_DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/varna_db
     PROD_DATABASE_URL=postgresql://neondb_owner:...@...aws.neon.tech/neondb
     JWT_SECRET=your_secure_jwt_secret
     NODE_ENV=development
     AI_API_URL=https://api.groq.com/openai/v1/chat/completions
     AI_MODEL=openai/gpt-oss-120b
     AI_API_KEY=your_api_key
     ```
4. Start the server:
   ```bash
   npm start
   ```

---

### Step 4: Frontend Configuration (Client)

1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the studio:
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:5173`

---

## ☁️ Deployment (Cloud)

### Backend (Render)
Varna is configured to seamlessly switch from a local setup to a production setup. When deploying the server folder on Render.com, configure the following Environment Variables in the Render Dashboard:

- `NODE_ENV`: `production`
- `PORT`: `5000` (or leave empty for Render to assign)
- `JWT_SECRET`: `your_secure_randomly_generated_string`
- `AI_API_URL`: `https://api.groq.com/openai/v1/chat/completions`
- `AI_MODEL`: `openai/gpt-oss-120b`
- `AI_API_KEY`: `your_api_key_for_ai`
- `DATABASE_URL`: `your_neon_tech_postgres_connection_string`

*Important for Neon DB*: If your Neon string contains `-pooler`, please **remove it** (e.g. `ep-long-bread.ap-southeast-1.aws` instead of `ep-long-bread-pooler.ap-southeast-1.aws`) to prevent PGBouncer cache issues.

### Frontend (GitHub Pages / Vercel / Netlify)
To connect your hosted frontend to your new Render backend, add the following environment variable to your deployment platform:

- `API_URL`: `https://your-render-backend-url.onrender.com`

---

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS (Varna Design Tokens), Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Structured Relational Ledger).
- **Authentication**: JWT (JSON Web Tokens) with Secure Middleware.
- **Architecture**: Domain-Driven Design for Artisans, NGOs, and Customers.

---

## 🤝 Contribution Guidelines
This project follows a strict aesthetic and coding standard. Ensure all commits align with the **Varna Design System** (Black, Yellow, and High-Contrast typography).

---
© 2026 VARNA Ecosystem. Authenticity by Tradition.
