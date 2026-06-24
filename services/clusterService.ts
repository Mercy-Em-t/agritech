import { PrismaClient } from '@prisma/client';
import { Kafka } from 'kafkajs';

const prisma = new PrismaClient();
const kafka = new Kafka({ clientId: 'coinos-cluster-service', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'cluster-matching-group' });
const producer = kafka.producer();

const MAX_CLUSTER_RADIUS_METERS = 50000; // 50km radius for proximity matching

export const startProximityClusterMatchingService = async () => {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'node.identity.registration', fromBeginning: false });

  console.log('🌍 [ClusterService] Listening for new Polymorphic Node registrations...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      const event = JSON.parse(message.value.toString());

      if (event.event_type === 'NODE_REGISTRATION_CONFIRMED') {
        console.log(`[ClusterService] Processing registration for Node ${event.node_id}`);
        await executeProximityScan(event.node_id);
      }
    },
  });
};

async function executeProximityScan(originNodeId: string) {
  try {
    // 1. Fetch the origin node's exact geometry to use as the center of our spatial search
    const originNodeResult = await prisma.$queryRaw<any[]>`
      SELECT node_id, geospatial_footprint 
      FROM nodes 
      WHERE node_id = ${originNodeId}::uuid;
    `;

    if (originNodeResult.length === 0) return;
    const originNode = originNodeResult[0];

    // 2. Perform a highly optimized PostGIS spatial query using ST_DWithin to find neighbors
    // This utilizes the GIST index created in Sprint 1 for sub-300ms execution.
    const neighbors = await prisma.$queryRaw<any[]>`
      SELECT 
        node_id, 
        legal_name,
        ST_DistanceSphere(geospatial_footprint, ${originNode.geospatial_footprint}) as distance_meters
      FROM nodes
      WHERE 
        node_id != ${originNodeId}::uuid
        AND ST_DWithin(
          geospatial_footprint::geography, 
          ${originNode.geospatial_footprint}::geography, 
          ${MAX_CLUSTER_RADIUS_METERS}
        )
      ORDER BY distance_meters ASC
      LIMIT 10;
    `;

    if (neighbors.length > 0) {
      console.log(`[ClusterService] Found ${neighbors.length} proximal nodes within 50km of ${originNodeId}.`);
      
      // 3. Emit a cluster aggregation event to orchestrate joint capacities
      await producer.send({
        topic: 'cluster.aggregation.detected',
        messages: [{
          key: originNodeId,
          value: JSON.stringify({
            event_type: 'SPONTANEOUS_CLUSTER_PROPOSED',
            origin_node_id: originNodeId,
            potential_neighbors: neighbors.map(n => ({
              node_id: n.node_id,
              distance_meters: n.distance_meters
            })),
            timestamp: new Date().toISOString()
          })
        }]
      });
    } else {
      console.log(`[ClusterService] No proximal nodes found for ${originNodeId} within 50km.`);
    }

  } catch (error) {
    console.error('CRITICAL_SPATIAL_QUERY_FAILURE:', error);
  }
}
