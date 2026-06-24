# System Design: Logistics Routing Logic

This blueprint maps out the internal logic for the Logistics Engine. Because we are dealing with biological assets governed by strict decay windows (`spoilage_critical_date`), routing cannot simply be based on the "cheapest" option. It must be a **Perishability-Weighted Match**.

## User Review Required

> [!IMPORTANT]
> **Dynamic Pricing vs. Fixed Rates**
> The design below uses a dynamic bidding/scoring system where the platform automatically calculates a `Transit_Score` based on proximity and vehicle capability. 
> *Do we want to allow Logistics Nodes to set their own manual per-km rates, or should the platform algorithmically lock in the transit fee to prevent price-gouging during high-demand harvest windows?*

## 🚚 1. Logistics Capability Sub-Schema

We expand the `has_logistics` capability from the Polymorphic Node Schema into a specific fleet profile. A Logistics Node must explicitly declare what kind of biological assets it can transport without causing spoilage.

```json
{
  "logistics_profile": {
    "fleet_type": "Enum[Cold_Chain, Flatbed_Bulk, Live_Plant_Carrier, Organic_Waste_Tipper]",
    "max_capacity_kg": "Decimal",
    "base_location": "Point(Long, Lat)",
    "operational_radius_km": "Decimal",
    "active_status": "Enum[Idle, In_Transit, Maintenance]"
  }
}
```

## 🧮 2. The Perishability-Weighted Algorithm (Transit Score)

When an asset hits the `HARVEST_READY` or `CASCADE_ENGAGED` state, the engine must select a transporter. We use a formula to calculate a **Transit Score ($S_t$)** for every available logistics node within the origin's radius. The highest score wins the dispatch contract.

Variables:
* $T_{\text{spoil}}$ = Time remaining until asset spoils (hours)
* $T_{\text{transit}}$ = Estimated transit time for the logistics node (hours)
* $C_{\text{match}}$ = Capability match multiplier (e.g., Cold Chain vehicle for Premium Grade = 1.5; Flatbed for Premium = 0.0)
* $D_{\text{cost}}$ = Distance cost factor

**The Algorithm:**

$$S_t = \left( \frac{T_{\text{spoil}} - T_{\text{transit}}}{T_{\text{spoil}}} \right) \times C_{\text{match}} - D_{\text{cost}}$$

*If $T_{\text{transit}} \ge T_{\text{spoil}}$, the score is instantly invalidated. The asset cannot survive the trip.*

## 🛣️ 3. Transit Event Sub-States

While the core asset is in the `LOGISTICS_DISPATCHED` macro-state, the logistics engine runs a high-frequency micro-state machine to monitor the physical journey and guarantee Proof-of-Delivery.

```
   [ 1. DISPATCH_AWARDED ] (Escrow locks transit fee)
            │
            ▼ (Driver confirms pickup at Origin Node)
   [ 2. IN_TRANSIT ] 
            │
            ├───────────────┐ (IoT Sensor triggers temp drop)
            ▼               ▼
   [ 3. ARRIVED_DESTINATION]   [ 3b. COLD_CHAIN_BREACH_DETECTED ] -> Triggers Insurance/Downgrade Event
            │
            ▼ (Destination Node signs Cryptographic Proof-of-Delivery)
   [ 4. TRANSIT_SETTLED ] (Releases transit fee to Logistics Node)
```

## 📡 4. Messaging Interface: Dispatch Trigger

When the Event State Machine needs a transporter, it broadcasts this payload to the Logistics Engine:

```json
{
  "event_id": "EVT_TRANS_102",
  "event_type": "LOGISTICS_DISPATCH_REQUIRED",
  "payload": {
    "asset_id": "ASSET_7712",
    "origin": { "node_id": "NODE_4401", "coords": [-1.2921, 36.8219] },
    "destination": { "node_id": "NODE_990", "coords": [-1.3050, 36.8500] },
    "required_fleet_type": "Cold_Chain",
    "total_weight_kg": 2500.00,
    "max_transit_time_hours": 12
  }
}
```

---

## Next Action

Please review the open question regarding dynamic pricing vs. fixed platform rates. Once approved, I can integrate these logistics models and scoring algorithms directly into our TypeScript scaffold to make the routing engine fully functional.
