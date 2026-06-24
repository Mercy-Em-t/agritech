import { Kafka } from 'kafkajs';
import { PrismaClient } from '@prisma/client';

const kafka = new Kafka({ clientId: 'coinos-iot-gateway', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'iot-telemetry-group' });
const producer = kafka.producer();
const prisma = new PrismaClient();

// Baseline constants for the Perishable Logistics Score (PLS) model
const OPTIMAL_TEMP_C = 4.0;
const OPTIMAL_HUMIDITY = 85.0;
const BASE_DECAY_RATE_PER_HOUR = 1.0; 

export const startIoTGatewayAggregator = async () => {
  await consumer.connect();
  await producer.connect();
  // Subscribe to the high-throughput MQTT-to-Kafka bridge topic
  await consumer.subscribe({ topic: 'iot.telemetry.transit', fromBeginning: false });

  console.log('📡 [IoTGateway] Hardware Telemetry Aggregator Online...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      const telemetry = JSON.parse(message.value.toString());

      if (topic === 'iot.telemetry.transit') {
        await processEnvironmentalDecay(telemetry);
      }
    },
  });
};

async function processEnvironmentalDecay(telemetry: any) {
  const { asset_id, temperature_c, humidity_percent, timestamp } = telemetry;

  // 1. Calculate the dynamic decay multiplier based on environmental deviation
  // If temperature spikes above optimal, decay accelerates exponentially.
  const tempDeviation = Math.max(0, temperature_c - OPTIMAL_TEMP_C);
  const humidityDeviation = Math.abs(OPTIMAL_HUMIDITY - humidity_percent);
  
  // Exponential decay model (simplified for edge processing)
  const dynamicDecayMultiplier = 1.0 + (tempDeviation * 0.15) + (humidityDeviation * 0.05);
  const acceleratedHourlyDecay = BASE_DECAY_RATE_PER_HOUR * dynamicDecayMultiplier;

  console.log(`[IoTGateway] Asset ${asset_id} | Temp: ${temperature_c}°C | Decay Multiplier: ${dynamicDecayMultiplier.toFixed(2)}x`);

  // 2. Fetch the current Asset State to update the Remaining Time-to-Live (TTL)
  // (Assuming an Asset table exists from our architecture blueprint)
  const asset = await prisma.$queryRaw<any[]>`
    SELECT remaining_ttl_hours, current_tier 
    FROM assets 
    WHERE asset_id = ${asset_id}::uuid;
  `;

  if (asset.length === 0) return;

  const newTtl = asset[0].remaining_ttl_hours - acceleratedHourlyDecay;

  // 3. Update the database with the new biologically-accurate TTL
  await prisma.$executeRaw`
    UPDATE assets 
    SET remaining_ttl_hours = ${newTtl}, updated_at = NOW()
    WHERE asset_id = ${asset_id}::uuid;
  `;

  // 4. Threshold Check: If the TTL drops below the critical safety threshold for Tier 1 (e.g., 24 hours)
  if (newTtl < 24 && asset[0].current_tier === 1) {
    console.warn(`⚠️ [IoTGateway] CRITICAL DECAY DETECTED FOR ASSET ${asset_id}. TTL: ${newTtl.toFixed(2)}h`);
    
    // Fire the Market Circuit Breaker cascade event directly to the state machine
    await producer.send({
      topic: 'market.routing.cascade',
      messages: [{
        key: asset_id,
        value: JSON.stringify({
          event_type: 'BIOLOGICAL_DEGRADATION_BREACH',
          asset_id: asset_id,
          reason: 'IoT Environmental Spike',
          new_ttl_hours: newTtl,
          timestamp: new Date().toISOString()
        })
      }]
    });
  }
}
