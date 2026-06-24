import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Kafka } from 'kafkajs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const kafka = new Kafka({ clientId: 'coinos-oracle-gateway', brokers: ['localhost:9092'] });
const producer = kafka.producer();

// The public key registry for authorized Oracle Nodes (Agronomists, IoT Spectrometers, 3PL Inspectors)
const AUTHORIZED_ORACLE_PUBLIC_KEYS: Record<string, string> = {
  'oracle-auth-node-1': `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----`
};

export const verifyOraclePayload = async (req: Request, res: Response): Promise<void> => {
  const { asset_id, oracle_id, grade_assigned, moisture_level, payload_signature } = req.body;

  if (!asset_id || !oracle_id || !grade_assigned || !payload_signature) {
    res.status(400).json({ error: 'Missing cryptographic payload parameters.' });
    return;
  }

  try {
    // 1. Fetch the authorized public key for the specific Oracle Node
    const publicKey = AUTHORIZED_ORACLE_PUBLIC_KEYS[oracle_id];
    if (!publicKey) {
      res.status(403).json({ error: 'UNAUTHORIZED: Oracle ID not recognized by the network.' });
      return;
    }

    // 2. Reconstruct the exact data string that the Oracle signed
    const dataString = `${asset_id}:${oracle_id}:${grade_assigned}:${moisture_level}`;

    // 3. Cryptographically verify the RSA signature
    const isVerified = crypto.verify(
      'RSA-SHA256',
      Buffer.from(dataString),
      publicKey,
      Buffer.from(payload_signature, 'base64')
    );

    if (!isVerified) {
      console.error(`🚨 [OracleGateway] CRITICAL: Cryptographic signature mismatch for Oracle ${oracle_id}`);
      res.status(403).json({ error: 'CRYPTOGRAPHIC_VERIFICATION_FAILED: Payload tampered or forged.' });
      return;
    }

    // 4. Verification Passed: Update Asset Grade in PostGIS
    await prisma.$executeRaw`
      UPDATE assets 
      SET verified_grade = ${grade_assigned}, 
          moisture_metric = ${moisture_level},
          oracle_verified_at = NOW()
      WHERE asset_id = ${asset_id}::uuid;
    `;

    // 5. Broadcast Trusted Quality Grade to the Event Bus
    await producer.connect();
    await producer.send({
      topic: 'oracle.quality.verified',
      messages: [{
        key: asset_id,
        value: JSON.stringify({
          event_type: 'ORACLE_GRADE_LOCKED',
          asset_id,
          grade_assigned,
          timestamp: new Date().toISOString()
        })
      }]
    });
    await producer.disconnect();

    console.log(`✅ [OracleGateway] Oracle ${oracle_id} successfully locked Grade ${grade_assigned} for Asset ${asset_id}`);
    res.status(200).json({ success: true, message: 'Oracle cryptographic payload verified and locked.' });

  } catch (error: any) {
    console.error('ORACLE_GATEWAY_FAILURE:', error);
    res.status(500).json({ error: 'Internal system failure during cryptographic validation.' });
  }
};
