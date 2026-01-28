# Varna Project Setup Guide

This guide covers the complete process to install, configure, migrate, and start the Varna application (Client and Server).

## Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **PostgreSQL** (running locally)
- **Git**

## 1. Database Setup

1.  Open your PostgreSQL tool (pgAdmin, psql, or command line).
2.  Create a new database named `varna_db`:
    ```sql
    CREATE DATABASE varna_db;
    ```
3.  Run the migration script to create tables.
    - **Using psql CLI**:
      ```bash
      psql -U postgres -d varna_db -f server/db/schema.sql
      ```
    - **Using pgAdmin**: Open the Query Tool for `varna_db`, copy the contents of [server/db/schema.sql](file:///d:/Projects/varna/server/db/schema.sql), and execute it.

## 2. Server Setup (Backend)

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - Create a [.env](file:///d:/Projects/varna/server/.env) file in the `server` directory (if it doesn't exist).
    - Add the following content (adjust credentials if needed):
      ```env
      PORT=5000
      DATABASE_URL=postgresql://postgres:postgres@localhost:5432/varna_db
      JWT_SECRET=your_secure_jwt_secret
      NODE_ENV=development
      GEMINI_API_KEY=your_gemini_api_key
      ```
      *(Note: Replace `postgres:postgres` with your actual DB username and password if different)*.

4.  Start the Server:
    ```bash
    npm start
    ```
    - You should see: `Server running on port 5000`.

## 3. Client Setup (Frontend)

1.  Open a **new** terminal window.
2.  Navigate to the client directory:
    ```bash
    cd client
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the Development Server:
    ```bash
    npm run dev
    ```
5.  Open your browser to the URL shown (usually `http://localhost:5173`).

## Troubleshooting

-   **Database Config**: If you see "password authentication failed", check your `DATABASE_URL` in [server/.env](file:///d:/Projects/varna/server/.env).
-   **Port Conflicts**: If port 5000 is busy, change `PORT` in [server/.env](file:///d:/Projects/varna/server/.env) and restart the server.
-   **Missing Modules**: Run `npm install` again in the respective directory.

## Project Structure
-   **server/**: Node.js + Express API
    -   `db/`: Database schemas
    -   `routes/`: API endpoints
-   **client/**: React + Vite + Tailwind CSS
