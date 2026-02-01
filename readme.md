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
     DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/varna_db
     JWT_SECRET=your_secure_jwt_secret
     NODE_ENV=development
     GEMINI_API_KEY=your_working_gemini_key
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
