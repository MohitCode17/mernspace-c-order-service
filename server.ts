import app from "./src/app";
import config from "config";
import logger from "./src/config/logger";
import connectDB from "./src/config/db";
import { MessageBroker } from "./src/types/broker";
import { createMessageBroker } from "./src/common/factories/brokerFactory";

const startServer = async () => {
  const PORT = config.get("server.port") || 5503;
  let broker: MessageBroker | null = null;

  try {
    await connectDB();

    // CONNECT TO KAFKA
    broker = createMessageBroker();
    await broker.connectConsumer();
    await broker.consumeMessage(["product"], false);

    app
      .listen(PORT, () => console.log(`Listening on port ${PORT}`))
      .on("error", (err) => {
        console.log("err", err.message);
        process.exit(1);
      });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (broker) {
        await broker.disconnectConsumer();
      }
      logger.error("Error happened: ", err.message);
      process.exit(1);
    }
  }
};

void startServer();
