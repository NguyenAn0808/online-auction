ONLINE AUCTION PROJECT - SETUP INSTRUCTIONS
===========================================

1. PREREQUISITES
----------------
- Node.js 
- npm (Node Package Manager)
- A Supabase account (https://supabase.com)

2. DATABASE SETUP (Supabase)
----------------------------
1.  Create a new project on Supabase.
2.  Go to Project Settings -> Database to get your connection strings if needed.
3.  Go to the **SQL Editor** in the side menu.
4.  **Initialize Schema**:
    - Open `backend/database/migrations/init_schema.sql`.
    - Copy the content and paste it into the Supabase SQL Editor.
    - Click "Run".
5.  **Seed Sample Data** (Optional but recommended):
    - Open `backend/database/migrations/seed_data.sql`.
    - Copy the content and paste it into the Supabase SQL Editor.
    - Click "Run".

3. BACKEND SETUP
----------------
1.  Open a terminal and navigate to the `backend` directory:
    cd backend

2.  Install dependencies:
    npm install

3.  Configure Environment Variables:
    - Copy the example environment file:
      cp .env.example .env
    - Open `.env` and fill in your details:
      - PORT=8000
      - SUPABASE_CONNECTION_STRING=YOUR_SUPABASE_CONNECTION_STRING
      - SUPABASE_URL=YOUR_SUPABASE_URL
      - SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
      - JWT/Auth secrets (random strings for development)
      - Email/OAuth credentials (optional for local dev if not testing those features)

4.  Start the Backend Server:
    npm run dev

    The server should start on http://localhost:8000.

4. FRONTEND SETUP
-----------------
1.  Open a new terminal and navigate to the `frontend` directory:
    cd frontend

2.  Install dependencies:
    npm install

3.  Configure Environment Variables:
    - Create a `.env` file in the `frontend` directory.
    - Add the following line:
      VITE_API_BASE_URL=http://localhost:8000
    - (Optional) VITE_TINYMCE_API_KEY=your_key_here

4.  Start the Frontend Development Server:
    npm run dev

    The application should be accessible at http://localhost:5173 (or the port shown in your terminal).

5. ACCESSING THE APPLICATION
----------------------------
Open your browser and go to: http://localhost:5173

6. SAMPLE ACCOUNTS (from seed_data.sql)
---------------------------------------
Password for all accounts: Password123

- Admin:   admin@example.com
- Seller:  seller@example.com
- Bidder 1: anhnguyen@example.com
- Bidder 2: nguyenan@example.com
