# CaféOS AI — Changelog

All notable changes to **CaféOS AI** are documented chronologically in this file.

---

## [1.2.0] - 2026-10-11
### Added
- **Dedicated Kitchen Display System (KDS)**: Real-time ticket management with color-coded states (`New`, `Preparing`, `Ready`, `Completed`), configurable elapsed prep warning timers, and new ticket arrival alerts.
- **Interactive Top-Down SVG Floor Map**: Architectural vector café layout with clickable zones, live simulated seat occupancy indicators, noise ratings (dB), and automatic AI zone matching.
- **Enhanced Manager Command Portal**: Operations telemetry (gross revenue, avg ticket, active brewing, overdue tickets), full order audit log, and full Menu Management CRUD (add, edit, delete, in-stock toggle).
- **Gemini Shift Intelligence**: AI generation of floor summaries, operational bottlenecks, customer trends, and actionable barista directives based on real shift metrics.
- **Digital 8-Stamp Passport & Achievements**: 8-stamp loyalty card (max 2 stamps/week) and 5 achievement badges (*Morning Regular*, *Focus Master*, *Social Butterfly*, *Coffee Explorer*, *Loyal Café Companion*).
- **Recognized Returning Member Experience**: Demo membership code lookup (`MEM-88`, `MEM-42`, `CAFE-VIP`) with personalized order history and 1-click reorder.
- **Role Switcher & Authentication**:
  - Manager Portal (`/admin`): ID `Cafe-admin`, Password `Admin-CafeOS1`
  - Kitchen KDS (`/chef`): ID `Cafe-chef`, Password `Chef-Cafe1`
- Comprehensive engineering documentation (`README.md`, `PRD.md`, `MVP.md`, `ARCHITECTURE.md`, `LOGIC.md`, `SECURITY.md`, `UAT.md`, `CHANGELOG.md`).

---

## [1.1.0] - 2026-10-11
### Added
- Synchronized server-side in-memory order pipeline connecting Customer orders to Kitchen and Manager views.
- Real-time order tracker synchronized with KDS ticket state changes.
- Automated client-server polling synchronization hook (3.5s interval).

---

## [1.0.0] - 2026-10-11
### Initial MVP Release
- Initial CaféOS AI application launch for Google Cloud Hackathon.
- Smart Welcome with time-aware greeting and intent selection (Deep Work, Meeting, Unwind, Surprise Me).
- Gemini 3.8 Flash server-side integration for intent-aware food and beverage pairings.
- 14-item specialty café catalog (8 drinks, 6 snacks with INR pricing).
- Shopping bag and simulated checkout.
- Room vibe community beacons and guest sentiment pulse widget.
