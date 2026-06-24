import { eventBus } from '../../packages/event-bus/index';
import { VirtualCooperative } from '../../packages/types/index';

export class ClusterAggregator {
  private activeClusters: Map<string, VirtualCooperative> = new Map();
  private readonly EDGE_FEE_PERCENTAGE = 0.05; // 5% platform edge fee

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    eventBus.onEvent('contract:fulfilled', (payload) => {
      console.log(`[ClusterAggregator] Contract fulfilled for Cluster ${payload.clusterId} with revenue ${payload.revenue}.`);
      this.executeMultiTenantSplit(payload.clusterId, payload.revenue);
    });
  }

  private executeMultiTenantSplit(clusterId: string, totalRevenue: number) {
    const cluster = this.activeClusters.get(clusterId);
    if (!cluster) {
      console.warn(`[ClusterAggregator] Cluster ${clusterId} not found for payout.`);
      return;
    }

    const edgeFee = totalRevenue * this.EDGE_FEE_PERCENTAGE;
    const distributableRevenue = totalRevenue - edgeFee;
    
    console.log(`[ClusterAggregator] Auto-extracted Edge Fee: ${edgeFee}. Distributing ${distributableRevenue} among ${cluster.memberNodes.length} nodes...`);
    
    const payoutPerNode = distributableRevenue / cluster.memberNodes.length; 
    
    cluster.memberNodes.forEach(node => {
      const nodePayout = (node.contribution_kg / cluster.consolidatedYieldKg) * distributableRevenue;
      console.log(`[ClusterAggregator] Dispatching ${nodePayout} to Node Wallet: ${node.node_id}`);
    });
  }

  public registerCluster(cluster: VirtualCooperative) {
    this.activeClusters.set(cluster.clusterId, cluster);
    console.log(`[ClusterAggregator] Formed Virtual Cooperative: ${cluster.clusterId} with yield ${cluster.consolidatedYieldKg}kg`);
  }

  public addNodeToCluster(clusterId: string, node: { node_id: string }, quantityKg: number) {
    const cluster = this.activeClusters.get(clusterId);
    if (cluster) {
      cluster.memberNodes.push({ node_id: node.node_id, contribution_kg: quantityKg });
      cluster.consolidatedYieldKg += quantityKg;
      console.log(`[ClusterAggregator] Node ${node.node_id} added ${quantityKg}kg to ${clusterId}. Total: ${cluster.consolidatedYieldKg}kg`);
    }
  }
}

export const clusterAggregator = new ClusterAggregator();
