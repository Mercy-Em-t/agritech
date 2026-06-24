# Asset Degradation Re-Calculation Protocol (Exception 1-4A)

## Trigger Condition
A Virtual Cluster (Virtual Co-Op) has been formed, but during the physical extraction or aggregation phase, an Oracle Node (quality inspector) flags a specific cultivator's contribution as sub-standard or spoiled.

## Automated Response Protocol
1. **Node Ejection:** The system severs the specific Cultivator Node's asset from the `Cluster_ID`.
2. **Volume Recalculation:** The aggregate `$Q_{Total}$` of the cluster is recalculated.
3. **Threshold Check:** 
   - **If $Q_{Total} \geq Q_{Target}$:** The contract proceeds without the ejected node.
   - **If $Q_{Total} < Q_{Target}$:** The system triggers an emergency spatial query to recruit a new Cultivator Node into the cluster within 10 minutes. If this fails, the institutional contract is voided, and the entire cluster drops to Tier 2 (Processing).
4. **Ejected Node Re-Routing:** The spoiled asset is immediately routed to Tier 3 (Biomass/Compost) to salvage base value.
