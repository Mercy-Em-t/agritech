import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Kafka } from 'kafkajs';

const prisma = new PrismaClient();
const kafka = new Kafka({ clientId: 'coinos-spot-market', brokers: ['localhost:9092'] });
const producer = kafka.producer();

// Mathematical constants for Dynamic Price Discovery
const BASE_MARKET_PRICE_USD_PER_KG = 2.50; // Baseline Spot Price
const LOCAL_GLUT_PENALTY_MULTIPLIER = 0.05; // 5% price drop per 100kg oversupply

export const getSpotMarketListings = async (req: Request, res: Response): Promise<void> => {
  const { lat, lon, radius_km = 20 } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: 'Missing geospatial anchoring coordinates.' });
    return;
  }

  try {
    // 1. Fetch downgraded (Tier 2/3) or unmatched assets within the buyer's localized radius
    const spotAssets = await prisma.$queryRaw<any[]>`
      SELECT 
        a.asset_id, 
        a.commodity, 
        a.quantity_kg, 
        a.remaining_ttl_hours,
        n.legal_name as cultivator_name,
        ST_DistanceSphere(n.geospatial_footprint, ST_MakePoint(${parseFloat(lon as string)}, ${parseFloat(lat as string)})) as distance_meters
      FROM assets a
      JOIN nodes n ON a.node_id = n.node_id
      WHERE 
        a.current_tier >= 2 
        AND a.status = 'AVAILABLE_SPOT'
        AND ST_DWithin(
          n.geospatial_footprint::geography, 
          ST_MakePoint(${parseFloat(lon as string)}, ${parseFloat(lat as string)})::geography, 
          ${parseInt(radius_km as string) * 1000}
        )
      ORDER BY a.remaining_ttl_hours ASC; -- Prioritize highly perishable assets
    `;

    // 2. Dynamic Price Discovery: Calculate the Localized Oversupply (Glut)
    const totalLocalVolumeKg = spotAssets.reduce((sum, asset) => sum + asset.quantity_kg, 0);
    const glutPenalty = Math.floor(totalLocalVolumeKg / 100) * LOCAL_GLUT_PENALTY_MULTIPLIER;
    const dynamicPriceUsdPerKg = Math.max(0.50, BASE_MARKET_PRICE_USD_PER_KG * (1 - glutPenalty)); // Price floor at $0.50

    // 3. Map dynamic pricing to the outbound payload
    const activeListings = spotAssets.map(asset => ({
      asset_id: asset.asset_id,
      commodity: asset.commodity,
      quantity_available_kg: asset.quantity_kg,
      distance_km: (asset.distance_meters / 1000).toFixed(2),
      time_to_live_hours: asset.remaining_ttl_hours.toFixed(1),
      dynamic_price_usd_per_kg: dynamicPriceUsdPerKg.toFixed(2),
      total_lot_price_usd: (asset.quantity_kg * dynamicPriceUsdPerKg).toFixed(2)
    }));

    res.status(200).json({
      success: true,
      market_metrics: {
        total_local_volume_kg: totalLocalVolumeKg,
        current_market_price_usd: dynamicPriceUsdPerKg.toFixed(2)
      },
      listings: activeListings
    });

  } catch (error: any) {
    console.error('CRITICAL_SPOT_MARKET_FAILURE:', error);
    res.status(500).json({ error: 'Internal system failure during spot market aggregation.' });
  }
};

export const executeSpotPurchase = async (req: Request, res: Response): Promise<void> => {
  const { asset_id, buyer_node_id } = req.body;
  // ... Transaction logic to lock the spot asset and clear fiat ...
};
