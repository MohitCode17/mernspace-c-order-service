import config from "config";
import { MessageBroker } from "../../types/broker";
import { kafkaBroker } from "../../config/kafka";

let broker: MessageBroker | null = null;

export const createMessageBroker = (): MessageBroker => {
  console.log("Connecting to kafka...");
  // Making singletone
  if (!broker) {
    broker = new kafkaBroker("order-service", config.get("kafka.broker"));
  }

  return broker;
};
