# CaféOS AI — System Architecture & Data Flow

## 1. System Overview
CaféOS AI is architected as a full-stack, single-container web application designed for Google Cloud Run. The server hosts both the REST API endpoints and mounts the React frontend bundle.

```
       +-----------------------------------------------------------+
       |                  CLIENT LAYER (React 19)                  |
       |  +--------------------+  +---------------+  +----------+  |
       |  |  Customer Portal   |  |  Kitchen KDS  |  | Manager  |  |
       |  |  (AI Barista, Map) |  |  (Chef View)  |  | (Pulse)  |  |
       |  +--------------------+  +---------------+  +----------+  |
       +-----------------------------+-----------------------------+
                                     |  HTTP REST / Polling (3.5s)
                                     v
       +-----------------------------------------------------------+
       |             SERVER LAYER (Node.js / Express)              |
       |                                                           |
       |   /api/recommendation  --> @google/genai (Gemini 3.8)    |
       |   /api/manager-insight --> @google/genai (Gemini 3.8)    |
       |   /api/orders          --> In-Memory Order Engine         |
       |   /api/menu            --> Dynamic Menu Store             |
       |   /api/occupancy       --> Simulated Zone Engine          |
       |   /api/auth/login      --> Role Access Validator          |
       +-----------------------------------------------------------+
                                     |
                                     v
       +-----------------------------------------------------------+
       |             GOOGLE CLOUD INFRASTRUCTURE                   |
       |  - Cloud Run (Container execution on PORT 3000)           |
       |  - Google Gemini API (gemini-3.8-flash via Secret Env)    |
       +-----------------------------------------------------------+
```

## 2. API Specifications

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/recommendation` | Invokes Gemini 3.8 Flash with structured schema to return drink, snack, zone & soundtrack match |
| `POST` | `/api/manager-insight` | Invokes Gemini 3.8 Flash to analyze active shift telemetry and feedback |
| `GET` | `/api/orders` | Retrieves all active and completed order records |
| `POST` | `/api/orders` | Creates new order ticket, initializes prep timer, assigns token `#CF-XXX` |
| `PATCH`| `/api/orders/:id/status` | Updates order state (`new` → `preparing` → `ready` → `completed`) |
| `PATCH`| `/api/orders/:id/threshold` | Sets per-order or global prep warning threshold minutes |
| `GET` | `/api/menu` | Retrieves current dynamic menu catalog |
| `POST` | `/api/menu` | Adds new menu item to catalog |
| `PUT` | `/api/menu/:id` | Modifies menu item price, description, or availability |
| `DELETE`| `/api/menu/:id` | Deletes menu item from catalog |
| `GET` | `/api/occupancy` | Retrieves live zone occupancy and acoustic metrics |
| `POST` | `/api/auth/login` | Authenticates Admin (`Cafe-admin`) and Chef (`Cafe-chef`) |

## 3. Data Synchronization Strategy
For the hackathon, an in-memory authoritative state is maintained on the Node.js server. The client utilizes a periodic 3.5-second polling synchronization pattern. When any actor (Customer placing order, Chef advancing status, Manager updating menu) writes to the server, all connected views reflect the updated state on the subsequent synchronization cycle.
