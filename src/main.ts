import fastifyCors from "@fastify/cors";
import closeWithGrace from "close-with-grace";
import { randomUUID } from "crypto";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import { Redis } from "ioredis";
import {
	CONNECTION_COUNT_KEY,
	CONNECTION_COUNT_UPDATE_CHANNEL,
	CORS_ORIGIN,
	HOST,
	NEW_MESSAGE_CHANNEL,
	PORT,
	UPSTASH_REDIS_REST_URL,
} from "./config/config";
import healthCheckHandler from "./handlers/healtchCheckHandler";

if (!UPSTASH_REDIS_REST_URL) {
	console.error("UPSTASH_REDIS_REST_URL is required");
	process.exit(1);
}

const publisher = new Redis(UPSTASH_REDIS_REST_URL);
const subscriber = new Redis(UPSTASH_REDIS_REST_URL);

let connectedClients = 0;

async function bootstrap() {
	const app = fastify();

	await app.register(fastifyCors, {
		origin: CORS_ORIGIN,
	});

	await app.register(fastifyIO);

	const currentCount = await publisher.get(CONNECTION_COUNT_KEY);

	if (!currentCount) {
		await publisher.set(CONNECTION_COUNT_KEY, 0);
	}

	app.io.on("connection", async (io) => {
		console.log("Client connected", io.id);

		const incResult = await publisher.incr(CONNECTION_COUNT_KEY);

		connectedClients++;

		await publisher.publish(CONNECTION_COUNT_UPDATE_CHANNEL, String(incResult));

		io.on(NEW_MESSAGE_CHANNEL, async (payload) => {
			const message = payload?.message;

			if (!message) {
				return;
			}

			await publisher.publish(NEW_MESSAGE_CHANNEL, message.toString());
		});

		io.on("disconnect", async () => {
			console.log("Client disconnected", io.id);
			connectedClients--;

			const decrResult = await publisher.decr(CONNECTION_COUNT_KEY);

			publisher.publish(CONNECTION_COUNT_UPDATE_CHANNEL, String(decrResult));
		});
	});

	subscriber.subscribe(CONNECTION_COUNT_UPDATE_CHANNEL, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${CONNECTION_COUNT_UPDATE_CHANNEL}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${CONNECTION_COUNT_UPDATE_CHANNEL}`);
	});

	subscriber.subscribe(NEW_MESSAGE_CHANNEL, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${NEW_MESSAGE_CHANNEL}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${NEW_MESSAGE_CHANNEL}`);
	});

	subscriber.on("message", (channel, text) => {
		if (channel === CONNECTION_COUNT_UPDATE_CHANNEL) {
			app.io.emit(CONNECTION_COUNT_UPDATE_CHANNEL, {
				count: text,
			});

			return;
		}

		if (channel === NEW_MESSAGE_CHANNEL) {
			app.io.emit(NEW_MESSAGE_CHANNEL, {
				message: text,
				id: randomUUID(),
				createAt: new Date().toISOString(),
				PORT,
			});

			return;
		}
	});

	app.get("/healthcheck", healthCheckHandler);

	return app;
}

async function main() {
	const app = await bootstrap();

	try {
		await app.listen({
			port: PORT,
			host: HOST,
		});

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
		console.log(`Server is running on http://${HOST}:${PORT}`);
	} catch (error) {
		console.error("Error starting server", error);
		process.exit(1);
	}
}

main();
