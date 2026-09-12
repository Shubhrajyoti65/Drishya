# Drishya 🎥 — AI-Powered Video Sharing & Creator Platform

Drishya is a modern video-sharing and creator platform built with React, Node.js, Express, MongoDB, and FastAPI AI services. It includes a full-featured **Creator Membership & Razorpay Payment System**, **Interactive Community Polls**, and **Gemini-powered AI Creator Tools**.

---

## 🔑 Environment Variables Configuration

### 1. Backend Configuration (`backend/.env`)

```env
PORT=8000
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Storage Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Payment Gateway Credentials (Test / Sandbox Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=drishya_webhook_secret_2026
```

### 2. Frontend Configuration (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_AI_API_URL=http://localhost:8001/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. AI Service Configuration (`ai-service/.env`)

```env
GEMINI_API_KEY=your_google_gemini_api_key
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8001
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

---

## 🛠️ How to Run the Application End-to-End

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI
- **Python**: v3.9 or higher (for AI microservice)

---

### Step 1: Run Backend (`backend/`)

1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start backend dev server:
   ```bash
   npm run dev
   ```
   > 🚀 Backend runs at `http://localhost:8000`

---

### Step 2: Run Frontend (`frontend/`)

1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start frontend app:
   ```bash
   npm run dev
   ```
   > 🌐 Frontend app runs at `http://localhost:3000`

---

### Step 3: Run AI Microservice (`ai-service/`)

1. Navigate to `ai-service`:
   ```bash
   cd ai-service
   ```
2. Create and activate virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Start FastAPI server:
   ```bash
   python main.py
   ```
   > 🤖 AI microservice runs at `http://localhost:8001` (Interactive Swagger Docs at `http://localhost:8001/api/docs`)

---

## 🌟 End-to-End User & Creator Workflow

1. **User Registration & Profile**:
   - Register a new creator account at `http://localhost:3000`.
   - Upload custom channel avatar and cover banner (handled seamlessly via Cloudinary).

2. **Creator Tier Configuration**:
   - Navigate to **Creator Studio** (`/creator/memberships`) or channel profile (`/channel/:username`).
   - Define membership tiers (e.g. Bronze ₹49/mo, Silver ₹99/mo, Gold ₹199/mo) with perks and custom theme badges.

3. **Uploading Members-Only & Public Videos**:
   - Navigate to **Upload** (`/upload`).
   - Upload video file + thumbnail, and set visibility (`PUBLIC`, `MEMBERS_ONLY`, or `TIER_ONLY`).

4. **Community Engagement & Editable Polls**:
   - Go to channel **Community Tab** (`/channel/:username/community`).
   - Click **"Add Poll"** to create a fully editable poll (custom prompt, add/remove choices up to 5).
   - Subscribers can vote live, view real-time percentage progress bars, and switch or undo votes anytime.

5. **Joining Channel Memberships & Razorpay Checkout**:
   - Subscribers click **"Join Membership"** on creator profiles.
   - Razorpay Checkout modal launches -> Complete test transaction.
   - Server verifies HMAC-SHA256 signature and activates membership + **[★ Member]** badges instantly!

---

## 🚀 Key Features

### 1. 📊 Interactive Editable Creator Polls
- **Customizable Question & Choices**: Creators can type custom poll prompts and manage up to 5 choice options.
- **Accurate Real-Time Math**: 0 initial fake votes with dynamic percentage progress calculation.
- **Flexible Voting**: Voters can switch their selection or click again to undo votes.

### 2. 🤖 AI Microservice (FastAPI + Gemini 2.5 Flash)
- **Video Title Generator**: Generates 5 high-CTR YouTube titles tailored for niche & target audience.
- **Content Idea Generator**: Recommends 5 personalized video ideas based on creator trends.
- **Thumbnail Designer**: Suggests visual concepts, color schemes, and layout directions (with FLUX generator fallback).

### 3. 🌟 Creator Memberships & Tiers
- Customizable membership tiers with prices in INR.
- Configurable tier names, descriptions, perks, theme colors, and badge icons.

### 4. 💳 Razorpay Payment Integration
- Server-side HMAC-SHA256 signature verification.
- Webhook listener for payment capture and subscription lifecycle events.

### 5. 🔒 Members-Only Video Streaming
- Visibility levels: `PUBLIC`, `MEMBERS_ONLY`, `TIER_ONLY`.
- Server-side video stream URL obfuscation for unauthorized users.

---

## 📂 API Endpoints Summary

### AI Microservice (`http://localhost:8001`)
- `GET /health` — Service health check
- `POST /api/v1/generate/video-titles` — Generate 5 optimized video titles
- `POST /api/v1/generate/content-ideas` — Generate personalized video ideas
- `POST /api/v1/generate/thumbnail-suggestions` — Generate thumbnail design suggestions

### Community & Posts (`http://localhost:8000/api/v1`)
- `GET /api/v1/tweets` — Fetch all community updates
- `POST /api/v1/tweets` — Create community post / poll
- `PATCH /api/v1/tweets/:tweetId` — Update post
- `DELETE /api/v1/tweets/:tweetId` — Delete post

### Membership Tiers & Payments
- `POST /api/v1/membership-tiers` — Create tier
- `GET /api/v1/membership-tiers/creator/:creatorId` — Fetch channel tiers
- `POST /api/v1/payments/create-order` — Create Razorpay order
- `POST /api/v1/payments/verify` — HMAC signature verification & activation
- `GET /api/v1/memberships/my-memberships` — User active memberships
