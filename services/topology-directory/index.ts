import { eventBus } from '../../packages/event-bus/index';
import { NodeIdentity } from '../../packages/types/index';

export class TopologyDirectory {
  private nodes: Map<string, NodeIdentity> = new Map();

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    eventBus.onEvent('node:registered', (payload) => {
      console.log(`[TopologyDirectory] Processing new node registration: ${payload.node.identity.legal_name}`);
      this.nodes.set(payload.node.node_id, payload.node);
      this.evaluateClustering(payload.node);
    });
  }

  private evaluateClustering(node: NodeIdentity) {
    if (node.capabilities.can_cultivate_crops) {
      console.log(`[TopologyDirectory] Evaluated Cultivator Node ${node.identity.legal_name}. Suggesting nearby Nursery Nodes to join Guild Cluster...`);
    }
  }

  public registerNode(node: NodeIdentity) {
    eventBus.emitEvent('node:registered', { node });
  }

  public getNode(nodeId: string): NodeIdentity | undefined {
    return this.nodes.get(nodeId);
  }
}

export const topologyDirectory = new TopologyDirectory();
