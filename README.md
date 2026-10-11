# CaféOS AI — Your Café, Your Vibe

**Google Cloud Hackathon — The Café Companion**  
*An Intent-Aware AI Café Experience, Kitchen Display & Operations Platform*

---

## 🌟 Overview

**CaféOS AI** transforms the traditional coffee shop from a transactional counter into an intelligent, connected hospitality platform. Built for Google Cloud's **The Café Companion** challenge, CaféOS AI unifies three core stakeholders through a single connected ecosystem:

1. **Customer Experience**: Intent-aware discovery (Deep Work, Meeting, Unwind, Surprise Me), personalized flavor & dietary recommendations powered by **Google Gemini 3.8 Flash**, interactive SVG seating map, digital 8-stamp loyalty passport, and live order progression.
2. **Kitchen Display System (KDS)**: High-contrast kitchen command center with live status tracking (`New` → `Preparing` → `Ready` → `Completed`), configurable elapsed prep warning timers, and auditory/visual alerts for new incoming tickets.
3. **Manager Pulse**: Real-time floor operations dashboard with live KPI telemetry, dynamic menu management (add/edit/delete/in-stock toggling), order audit logs, and one-click **Gemini AI Shift Directives** summarizing floor bottlenecks and operational suggestions.

---

## ☕ Key Features

- **Intent-Aware AI Barista**: Recommends drinks and food pairings strictly from the curated menu based on visit intent, temperature preference, dietary restrictions, and budget (₹150–₹500).
- **Interactive SVG Floor Map**: Top-down architectural layout of the café with live simulated occupancy, acoustic ratings (dB), power socket availability, and automatic zone highlighting based on customer intent.
- **Synchronized Order Lifecycle**: Orders placed by customers are immediately received by the kitchen KDS and tracked in real-time. When baristas update tickets, the customer tracker and manager telemetry update simultaneously.
- **Loyalty & Achievement Badges**: 8-stamp digital coffee passport with qualifying visit rules (max 2 stamps/week) and 5 distinct achievement badges (*Morning Regular*, *Focus Master*, *Social Butterfly*, *Coffee Explorer*, *Loyal Café Companion*).
- **Recognized Returning Customers**: Demo membership codes (`MEM-88`, `MEM-42`, `CAFE-VIP`) unlock order history, favorite pairings, and 1-click reordering.
- **Dynamic Menu Management**: Floor managers can adjust pricing, descriptions, and toggle "In Stock" or "Sold Out" status, immediately updating the AI recommendation model.
- **Predefined Demo Role Access**:
  - **Admin Login** (`/admin`): ID `Cafe-admin`, Password `Admin-CafeOS1`
  - **Chef Login** (`/chef`): ID `Cafe-chef`, Password `Chef-Cafe1`

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **AI Engine**: Google Gen AI SDK (`@google/genai`), Model: `gemini-3.8-flash`
- **Hosting & Deployment**: Google Cloud Run ready, standard port `3000` / `process.env.PORT`
- **Security**: Server-side only Gemini API key access via `process.env.GEMINI_API_KEY`

---

## 🚀 Local Development & Deployment

### Prerequisites
- Node.js 20+
- Google Gemini API Key configured in `.env` (`GEMINI_API_KEY="your-api-key"`)

### Installation & Run
```bash
# Install dependencies
npm install

# Start full-stack development server (Express + Vite)
npm run dev

# Build for production
npm run build

# Start production server (Cloud Run)
npm run start
```
The app runs on `http://localhost:3000`.
