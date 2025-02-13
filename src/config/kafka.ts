import { Consumer, EachMessagePayload, Kafka } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { handleProductUpdate } from "../productCache/productUpdateHandler";

export class kafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });
    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disconnectConsumer() {
    await this.consumer.disconnect();
  }

  /**
   *
   * @param topic - the topic to send the message to
   * @param message - The message to send
   * @throws {Error} - When the producer is not connected
   */
  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        // LOGIC TO HANDLE INCOMING MESSAGES
        switch (topic) {
          case "product":
            await handleProductUpdate(message.value.toString());
        }

        console.log({
          value: message.value.toString(),
          topic,
          partition,
        });
      },
    });
  }
}
