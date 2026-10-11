# CaféOS AI — Application Logic & Algorithms

## 1. Recommendation Engine (Gemini 3.8 Flash)
The recommendation pipeline executes the following sequence:
1. **Context Extraction**: Gathers visit intent (`deep_work`, `meeting`, `unwind`, `surprise_me`), time of day (`morning`, `afternoon`, `evening`), beverage style, temperature, dietary limitations, budget target (₹150–₹500), and past order history (if recognized member).
2. **Dynamic Menu Injection**: Supplies Gemini with the current active items in `DYNAMIC_MENU` so sold-out or edited items are respected.
3. **Strict Schema Enforcement**: Constrains output via `@google/genai` `responseSchema` to guarantee structured JSON output containing exact item names and prices.
4. **Spatial Mapping**: Recommends the corresponding seating zone:
   - `deep_work` $\to$ **Focus Corner** (40 dB, quiet acoustic panels, power outlets)
   - `meeting` $\to$ **Social Table** (65 dB, communal oak bench, natural lighting)
   - `unwind` $\to$ **Cozy Lounge** (50 dB, low-slung armchairs, soft lamps)
   - `surprise_me` $\to$ **Barista Tasting Bench** (58 dB, bar stools facing roaster)
5. **Fallback Safety Engine**: In the event of API timeout or missing keys, executes the deterministic Sommelier matrix ensuring zero user disruption.

## 2. Order Lifecycle & Elapsed Timers
1. **Creation**: Order assigned unique ID, random `#CF-XXX` token, and `createdAt` timestamp (milliseconds). Status initialized to `new`.
2. **KDS Elapsed Time Calculation**: Elapsed duration is computed continuously as:
   $$\text{Elapsed Time} = \text{Date.now}() - \text{order.createdAt}$$
   Because calculations derive from fixed timestamps, component re-renders or tab switches do not reset or distort the elapsed timer.
3. **Overdue Warning Trigger**:
   $$\text{Is Overdue} = (\text{Elapsed Time} > \text{thresholdMinutes} \times 60 \times 1000) \land (\text{Status} \ne \text{'completed'})$$
   Triggering orders flash with a high-visibility red alert on the KDS.
4. **Status Transitions**:
   - $\text{new} \xrightarrow{\text{Chef accepts}} \text{preparing}$ (logs `preparationStartedAt`)
   - $\text{preparing} \xrightarrow{\text{Barista crafts}} \text{ready}$ (logs `readyAt`)
   - $\text{ready} \xrightarrow{\text{Tray delivered}} \text{completed}$ (logs `completedAt`)

## 3. Loyalty & Digital Stamp Card
- **Qualifying Purchase**: Every completed demo order yields $+1$ stamp.
- **Fair Use Rule**: Maximum 2 qualifying stamps per calendar week to prevent artificial rapid accumulation.
- **Reward Unlock**: Accumulating 8 stamps activates $+1$ free beverage reward, inserting a zero-rupee complimentary drink voucher in the checkout bag.

## 4. Achievement Badges Logic
- **Morning Regular**: Granted when $\text{morningVisits} \ge 3$.
- **Focus Master**: Granted when $\text{deepWorkSessions} \ge 5$.
- **Social Butterfly**: Granted when $\text{meetingSessions} \ge 3$.
- **Coffee Explorer**: Granted when $\text{uniqueDrinksCount} \ge 5$.
- **Loyal Café Companion**: Granted when $\text{totalVisits} \ge 8$.
