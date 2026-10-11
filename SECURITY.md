# CaféOS AI — Security, Privacy & Compliance Architecture

## 1. API Key Protection
- **Server-Side Isolation**: The Google Gemini API key (`GEMINI_API_KEY`) is stored strictly in server-side environment variables and accessed via `process.env.GEMINI_API_KEY`.
- **Zero Client Exposure**: The `@google/genai` TypeScript SDK is never bundled into client JavaScript. Browser requests communicate with the server exclusively via proxy routes (`/api/recommendation` and `/api/manager-insight`).
- **Telemetry Compliance**: The SDK client initializes with `httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }` to ensure secure upstream observability.

## 2. Demo Scope & Sensitive Data Handling
- **No Real Payments**: The checkout system simulates payment methods (UPI, Card, Counter). No credit card numbers, CVVs, UPI PINs, or financial transactions are collected or stored.
- **No Personal Identifiable Information (PII)**: User names, table numbers, and membership codes are strictly demo handles stored ephemerally in server memory and client `localStorage`.
- **Demo Role Authentication**: The role switcher uses credential sets (`Cafe-admin` / `Admin-CafeOS1` and `Cafe-chef` / `Chef-Cafe1`) for simulated role switching and hackathon evaluation. In production, this would be replaced with Google Workspace OAuth or Firebase Authentication.

## 3. Production Deployment Hardening Checklist
Before taking this system to a commercial retail deployment:
1. **Database Migration**: Migrate from server in-memory storage to Google Cloud SQL (PostgreSQL) or Firestore with Row-Level Security (RLS).
2. **Authentication**: Implement Firebase Authentication with multi-factor authentication (MFA) for management staff.
3. **PCI-DSS Compliance**: Integrate certified payment processors (e.g., Stripe Elements or Razorpay Checkout) with webhooks.
4. **Rate Limiting**: Enforce IP and token bucket rate limiting on `/api/*` endpoints to protect Gemini quota.
