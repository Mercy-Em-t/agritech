# Frontend Developer Onboarding Guide

Welcome to the CoinOS mobile edge team! As a frontend developer, you are building the exact touchpoints where the biological realities of farming hit our digital platform.

## 1. Project Philosophy
CoinOS is **Asset-Light**. We do not own trucks, farms, or processing plants. The mobile app you are building is the sole coordinator for actors performing these physical tasks. 

**Rule #1: Treat connection as a luxury.** Farmers operate in rural dead-zones. The app must be designed "Offline-First".

## 2. The Tech Stack
* **Framework:** React Native / Expo
* **State Management:** Zustand (for lightweight local sync queues)
* **Local DB:** WatermelonDB or SQLite (to handle local data caching and offline queueing)
* **Maps:** React Native Maps (with GeoJSON payload support)

## 3. Core Developer Workflow

### A. The "Sync Engine" Concept
Never `fetch()` or `axios.post()` directly in a UI component button click. 
All interactions (e.g., logging a harvest) push an event object into a local SQLite queue. A background worker listens for a `NetInfo` cellular connection and flushes the queue to our `/api/v1/sync` endpoint.

### B. Handling the Polymorphic Node
There is no "Farmer App" and "Buyer App". It is one app. The UI dynamically renders based on the user's `capability_flags` retrieved from the JWT token.
- If `can_cultivate_crops === true`, render the Supply Forecast Dashboard.
- If `can_provide_logistics === true`, render the 3PL Route Map.

### C. Ledger UI
Do not display fiat currency (USD) to cultivators unless they explicitly click "Cash Out". All balances should be abstracted into progress bars showing "Available Seedling Power" or "Escrow Secured". This prevents cognitive overload and reinforces the closed-loop nature of the credit voucher system.
