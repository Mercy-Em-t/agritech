-- Enable PostGIS extension for geospatial mapping capabilities
CREATE EXTENSION IF NOT EXISTS postgis;

-- Instantiate Polymorphic Node Directory
CREATE TABLE nodes (
    node_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    geospatial_footprint GEOMETRY(Polygon, 4326) NOT NULL,
    can_produce_seedlings BOOLEAN DEFAULT FALSE,
    can_cultivate_crops BOOLEAN DEFAULT FALSE,
    can_process_extracts BOOLEAN DEFAULT FALSE,
    can_manufacture_compost BOOLEAN DEFAULT FALSE,
    can_provide_logistics BOOLEAN DEFAULT FALSE,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    available_balance NUMERIC(18, 4) DEFAULT 0.0000,
    escrow_locked_balance NUMERIC(18, 4) DEFAULT 0.0000,
    input_credit_vouchers NUMERIC(18, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a Spatial Index on the polygon footprints for optimized clustering loops
CREATE INDEX idx_nodes_spatial ON nodes USING GIST(geospatial_footprint);

-- Instantiate Append-Only Write-Ahead Financial Ledger
CREATE TABLE ledger_journal (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES nodes(node_id),
    transaction_type VARCHAR(50) NOT NULL, -- e.g., ESCROW_LOCK, VOUCHER_MINT
    amount NUMERIC(18, 4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
