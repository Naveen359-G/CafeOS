# CaféOS AI — User Acceptance Testing (UAT) Report

## 1. Test Summary
- **Application**: CaféOS AI — Your Café, Your Vibe
- **Target Platform**: Google Cloud Run (Node.js 20, Port 3000)
- **Model Evaluated**: Google Gemini 3.8 Flash (`gemini-3.8-flash`)
- **Evaluation Date**: 2026-10-11
- **Status**: ✅ **100% PASS (All 14 Scenarios Verified)**

---

## 2. Test Execution Scenarios & Results

| # | Scenario | Steps Executed | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|---|
| 1 | **Intent Selection & Greeting** | Open app, select "Deep Work", input name "Naveen" | Time-aware greeting displays with Focus Corner zone pairing | Displayed "Good morning, Naveen" with Focus Corner | ✅ PASS |
| 2 | **AI Barista Gemini Call** | Set Hot, Vegan, Budget ₹450, click "Ask AI Barista" | Server calls Gemini 3.8 Flash; returns valid JSON with menu items | Returned Oat Milk Flat White + Avocado Tartine within budget | ✅ PASS |
| 3 | **Order Placement** | Add Pairing to bag, select Table 4, submit demo order | Order created with token `#CF-XXX`, cart cleared, tracker opens | Order `#CF-105` generated, tracker modal launched | ✅ PASS |
| 4 | **Kitchen Ticket Reception** | Switch to Kitchen KDS role (`Cafe-chef`) | New order appears with Green status, correct items & elapsed timer | Ticket `#CF-105` visible in New column with timer ticking | ✅ PASS |
| 5 | **Kitchen State Transition** | Click "Start Preparing", then "Mark Ready" | Status advances to amber then blue; timestamps logged | Status transitioned cleanly; timestamps recorded | ✅ PASS |
| 6 | **Customer Tracker Sync** | Verify Customer view while Kitchen updates status | Customer Tracker stepper advances to "Brewing" then "Ready" | Customer tracker synchronized across tabs | ✅ PASS |
| 7 | **Overdue Alert Logic** | Set threshold to 2m on active order exceeding 2m | Card displays red border, warning icon, and warning counter | Card highlighted in red with warning alert | ✅ PASS |
| 8 | **Manager Operations Telemetry** | Switch to Manager Portal (`Cafe-admin`) | KPIs display total orders, simulated gross, avg ticket value | Displayed accurate calculated metrics from order history | ✅ PASS |
| 9 | **Gemini Shift Insights** | Click "Generate Gemini Shift Insight" in Manager tab | Gemini analyzes shift data; returns summary and directive | Generated 2-sentence summary and floor directive | ✅ PASS |
| 10 | **Menu Management CRUD** | Add new pastry, edit price, toggle availability | Menu updates in real-time and reflects in AI Barista catalog | New item added, price updated, sold-out respected | ✅ PASS |
| 11 | **Interactive SVG Floor Map** | Navigate to Room Vibe, click Focus Corner & Social Table | Selected zone inspector displays occupancy, noise dB, power | SVG rendered cleanly with interactive seat telemetry | ✅ PASS |
| 12 | **Loyalty Stamp Accumulation** | Complete order, verify digital 8-stamp card | Stamp added to passport; reward unlocks at 8 stamps | Stamp count updated, reward voucher generated at 8 | ✅ PASS |
| 13 | **Recognized Member Lookup** | Lookup member `MEM-88` in member modal | Displays Aarav Mehta, past orders, 1-click reorder | Pre-filled profile and added favorite combo to bag | ✅ PASS |
| 14 | **Role Authentication** | Test login at `/admin` and `/chef` with valid/invalid credentials | Valid credentials grant access; invalid credentials error | Tested `Cafe-admin`/`Admin-CafeOS1` & `Cafe-chef`/`Chef-Cafe1` | ✅ PASS |
