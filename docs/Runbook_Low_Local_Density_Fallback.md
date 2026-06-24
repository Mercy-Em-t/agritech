# Low Local Density Fallback Strategy (Exception 1-3A)

## Trigger Condition
The Proximity Cluster Engine triggers a spatial radius query to combine fractional yields, but fails to find enough neighbors within the defined maximum transit radius (e.g., 50km) to meet the Institutional Contract Threshold.

## Automated Response Protocol
1. **Cluster Abort:** The system drops the temporary `Cluster_ID` and returns the asset to an independent state.
2. **Market Re-Routing:** The asset is automatically shifted from the B2B Institutional Order Book to the B2C Local Spot Market.
3. **Price Recalculation:** The expected payout is recalculated based on local spot prices rather than premium export prices.
4. **Cultivator Notification:** A push notification is sent to the Cultivator Node: *"Insufficient local volume for corporate export. Asset routed to local spot market at current market rate."*
