import closeWithGrace from "close-with-grace";
import { FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import { CONNECTION_COUNT_KEY, HOST, PORT } from "../config/config";
import ConnectedClients from "./ConnectedClients";

export async function startServer(app: FastifyInstance, publisher: Redis) {
	try {
		await app.listen({
			port: PORT,
			host: HOST,
		});

		await setupGracefulShutdown(app, publisher);

		console.log(`Server is running on http://${HOST}:${PORT}`);
	} catch (error) {
		console.error("Error starting server", error);
		process.exit(1);
	}
}

export async function setupGracefulShutdown(app: FastifyInstance, publisher: Redis) {
	const connectedClients = new ConnectedClients().count;

	closeWithGrace(
		{
			delay: 2000,
		},
		async () => {
			if (connectedClients > 0) {
				const currentCount = parseInt((await publisher.get(CONNECTION_COUNT_KEY)) || "0", 10);

				const newCount = Math.max(currentCount - connectedClients, 0);

				await publisher.set(CONNECTION_COUNT_KEY, newCount);
			}

			await app.close();
		}
	);
}
