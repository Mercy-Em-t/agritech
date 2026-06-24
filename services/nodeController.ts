import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Kafka } from 'kafkajs';

const prisma = new PrismaClient();
const kafka = new Kafka({ clientId: 'coinos-core', brokers: ['localhost:9092'] });
const producer = kafka.producer();

export const registerPolymorphicNode = async (req: Request, res: Response): Promise<void> => {
  const { legal_name, geospatial_footprint, capabilities, wallet_address } = req.body;

  // Enforce validation bounds against spatial payload structure
  if (!legal_name || !geospatial_footprint || !wallet_address) {
    res.status(400).json({ error: 'Missing critical identity, spatial footprint, or ledger anchor fields.' });
    return;
  }

  try {
    // Initialize atomic write operations
    const result = await prisma.$transaction(async (tx) => {
      // 1. Persist the polymorphic node profile inside PostGIS using raw geometry interpolation
      const geoJsonString = JSON.stringify(geospatial_footprint);
      const createdNode = await tx.$queryRaw<any[]>`
        INSERT INTO nodes (
          legal_name, 
          geospatial_footprint, 
          can_produce_seedlings, 
          can_cultivate_crops, 
          can_process_extracts, 
          can_manufacture_compost, 
          can_provide_logistics,
          wallet_address
        ) VALUES (
          ${legal_name}, 
          ST_GeomFromGeoJSON(${geoJsonString}), 
          ${capabilities.can_produce_seedlings || false}, 
          ${capabilities.can_cultivate_crops || false}, 
          ${capabilities.can_process_extracts || false}, 
          ${capabilities.can_manufacture_compost || false}, 
          ${capabilities.can_provide_logistics || false},
          ${wallet_address}
        ) RETURNING node_id, legal_name, wallet_address, created_at;
      `;

      const node = createdNode[0];

      // 2. Log initial setup entry into the append-only write-ahead ledger journal
      await tx.ledgerJournal.create({
        data: {
          node_id: node.node_id,
          transaction_type: 'NODE_INITIALIZATION',
          amount: 0.0000
        }
      });

      return node;
    });

    // 3. Emit Node Initialization event to the Kafka bus for real-time proximity clustering matching
    await producer.connect();
    await producer.send({
      topic: 'node.identity.registration',
      messages: [{
        key: result.node_id,
        value: JSON.stringify({
          event_type: 'NODE_REGISTRATION_CONFIRMED',
          node_id: result.node_id,
          legal_name: result.legal_name,
          wallet_address: result.wallet_address,
          timestamp: result.created_at
        })
      }]
    });
    await producer.disconnect();

    res.status(201).json({ success: true, node_id: result.node_id, message: 'Polymorphic Node successfully registered.' });
  } catch (error: any) {
    console.error('CRITICAL_NODE_REGISTRATION_FAILURE:', error);
    res.status(500).json({ error: 'Internal server error during database spatial mutation write.' });
  }
};
