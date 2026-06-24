import { Kafka, Producer, Consumer } from 'kafkajs';
import { AgritechEvents } from '../types/index';

class AgritechEventBus {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private isConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'agritech-core',
      brokers: ['localhost:9092'] // Corresponds to the docker-compose setup
    });

    this.producer = this.kafka.producer();
    // Default consumer group for the main application
    this.consumer = this.kafka.consumer({ groupId: 'agritech-main-group' });
  }

  public async connect() {
    if (this.isConnected) return;
    await this.producer.connect();
    await this.consumer.connect();
    this.isConnected = true;
    console.log('[KafkaBus] Successfully connected to Kafka Broker');
  }

  public async emitEvent<K extends keyof AgritechEvents & string>(eventName: K, payload: AgritechEvents[K]) {
    if (!this.isConnected) await this.connect();
    
    console.log(`[KafkaBus] Emitting ${eventName}`, payload);
    
    await this.producer.send({
      topic: eventName,
      messages: [
        { value: JSON.stringify(payload) }
      ],
    });
  }

  public async onEvent<K extends keyof AgritechEvents & string>(eventName: K, listener: (payload: AgritechEvents[K]) => void) {
    if (!this.isConnected) await this.connect();

    await this.consumer.subscribe({ topic: eventName, fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (topic === eventName && message.value) {
          const payload = JSON.parse(message.value.toString()) as AgritechEvents[K];
          listener(payload);
        }
      },
    });
  }
}

// Export a singleton instance of the new Kafka-powered event bus
export const eventBus = new AgritechEventBus();
