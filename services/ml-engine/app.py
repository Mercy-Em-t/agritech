import json
import logging
from confluent_kafka import Consumer, Producer
from model import DecayPredictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("coinos-ml-engine")

# 1. Initialize the Kafka Intercept Boundaries
KAFKA_BROKER = 'localhost:9092'

consumer_conf = {
    'bootstrap.servers': KAFKA_BROKER,
    'group.id': 'ml-predictive-routing-group',
    'auto.offset.reset': 'earliest'
}

producer_conf = {
    'bootstrap.servers': KAFKA_BROKER
}

consumer = Consumer(consumer_conf)
producer = Producer(producer_conf)

# 2. Instantiate the Scikit-Learn Predictive Model
predictor = DecayPredictor()

def delivery_report(err, msg):
    if err is not None:
        logger.error(f"Message delivery failed: {err}")
    else:
        logger.info(f"Message delivered to {msg.topic()} [{msg.partition()}]")

def main():
    # Subscribe to the high-throughput IoT hardware stream
    consumer.subscribe(['iot.telemetry.transit'])
    logger.info("🧠 [MLEngine] Predictive Biological Routing node online. Listening for IoT telemetry...")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                logger.error(f"Consumer error: {msg.error()}")
                continue

            try:
                # 3. Parse the incoming IoT environmental payload
                payload = json.loads(msg.value().decode('utf-8'))
                asset_id = payload.get('asset_id')
                temp_c = payload.get('temperature_c', 4.0)
                humidity = payload.get('humidity_percent', 85.0)
                current_ttl = payload.get('remaining_ttl_hours', 72.0)
                hours_transit = payload.get('hours_in_transit', 0.0)

                # 4. Execute ML Prediction
                projected_ttl = predictor.predict_hours_until_spoilage(
                    current_ttl_hours=current_ttl,
                    temp_c=temp_c,
                    humidity=humidity,
                    hours_transit=hours_transit
                )

                logger.info(f"[MLEngine] Asset {asset_id} | Live Temp: {temp_c}°C | Projected TTL: {projected_ttl}h")

                # 5. Proactive Routing: If predicted to drop below 24h safety limit before arrival, route early.
                if projected_ttl < 24.0:
                    logger.warning(f"🚨 [MLEngine] Predictive Breach! Asset {asset_id} will spoil. Rerouting to Spot Market.")
                    
                    alert_payload = {
                        "event_type": "PROACTIVE_ML_DOWNGRADE",
                        "asset_id": asset_id,
                        "projected_ttl": projected_ttl,
                        "reason": "ML Regression Predicted Spoilage"
                    }
                    
                    # Intercept the Circuit Breaker before biological decay actually happens
                    producer.produce(
                        'market.routing.cascade', 
                        key=str(asset_id).encode('utf-8'),
                        value=json.dumps(alert_payload).encode('utf-8'),
                        callback=delivery_report
                    )
                    producer.poll(0)

            except Exception as e:
                logger.error(f"Payload processing error: {e}")

    except KeyboardInterrupt:
        logger.info("Shutting down ML Engine...")
    finally:
        consumer.close()

if __name__ == '__main__':
    main()
