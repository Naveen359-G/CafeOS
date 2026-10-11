# CaféOS AI — Product Requirements Document (PRD)

## 1. Vision & Executive Summary
CaféOS AI transforms specialty cafés into intelligent, personalized, and operationally connected environments. Instead of viewing a café visit as a simple coffee transaction, CaféOS AI recognizes that guests visit cafés with specific intents (deep focus, collaborative meetings, winding down, or seeking discovery) and provides an end-to-end platform connecting the guest, the kitchen, and floor operations.

## 2. Target Personas
1. **The Intent-Driven Guest (Customer)**: Remote workers, creatives, students, and socializers seeking the ideal beverage, food pairing, and table environment tailored to their budget and dietary needs.
2. **The Barista / Head Chef (Kitchen)**: Needs clear, organized, prioritized order tickets with live elapsed preparation timers and distinct status controls without paper clutter.
3. **The Café Manager / Roaster (Operations)**: Needs real-time shift analytics, customer sentiment, menu availability controls, and AI-driven operational guidance to eliminate bottlenecks.

## 3. Core Functional Requirements

### 3.1 Customer Experience
- **Intent Selection**: Deep Work, Meeting, Unwind, Surprise Me with time-aware greeting.
- **Preference Matrix**: Beverage type (Coffee, Tea, Any), temperature (Hot, Iced, Either), dietary restrictions (Oat milk, Dairy-Free, Vegan, Nut-Free, Decaf), and budget slider (₹150 to ₹500).
- **Gemini Recommendations**: Server-side structured recommendation selecting strictly from active menu items with pairing rationale, spatial zone match, and ambient soundtrack recommendation.
- **Order Placement**: Demo order generation with table number, special instructions, and simulated payment (UPI, Card, Counter).
- **Live Order Tracker**: Real-time synchronization with kitchen status updates (`new` → `preparing` → `ready` → `completed`).
- **Interactive Floor Map**: Vector top-down SVG plan illustrating zones (Focus Corner, Social Table, Cozy Lounge, Barista Bench) with live simulated seat occupancy and noise levels.
- **Loyalty Passport & Badges**: 8-stamp loyalty card (max 2 stamps/week) and 5 milestone achievement badges.
- **Returning Customer Experience**: Demo membership code lookup (`MEM-88`, `MEM-42`, `CAFE-VIP`) with 1-click reorder of favorite combos.

### 3.2 Kitchen Display System (KDS)
- **High-Visibility Interface**: Dark mode display optimized for kitchen tablet screens.
- **Order Cards**: Token ID, customer name, location/table, item list with quantities, special requests, and elapsed timer.
- **Status Stepper**: Action buttons (`Start Preparing`, `Mark Ready`, `Complete Order`).
- **Configurable Threshold**: Warning alerts when ticket preparation exceeds threshold (default 2 minutes).
- **Arrival Alerts**: Visual banner notifying of new incoming orders.

### 3.3 Manager Intelligence
- **Operational KPIs**: Orders count, simulated gross revenue, average ticket value, average preparation latency, and overdue tickets.
- **Menu Management**: Full CRUD interface to add new items, update prices, edit descriptions, and toggle stock availability.
- **Gemini Shift Intelligence**: AI generation of shift summaries, bottlenecks, customer trends, and actionable barista directives.

## 4. Success Criteria
- Zero mock fallbacks for live AI when API key is provided.
- Seamless synchronization between customer order placement and kitchen KDS.
- Zero broken images, consistent typography, and full mobile-first responsiveness.
- Under 2-minute deployment turnaround on Google Cloud Run.
