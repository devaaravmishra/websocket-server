import { UPSTASH_REDIS_REST_URL } from "./config/config";
import { setupSocketHandler } from "./handlers/socketHandler";
import setupHealthCheckRoute from "./routes/healthcheck";
import createServer from "./utils/createServer";
import { createRedisClients, setupConnectedClients } from "./utils/redis";
import { startServer } from "./utils/serverLifecycle";

if (!UPSTASH_REDIS_REST_URL) {
	console.error("UPSTASH_REDIS_REST_URL is required");
	process.exit(1);
}

async function bootstrap() {
	const app = await createServer();
	const { publisher, subscriber } = createRedisClients();

	await setupConnectedClients(publisher);
	await setupSocketHandler(app, publisher, subscriber);
	setupHealthCheckRoute(app);

	return { app, publisher, subscriber };
}

async function main() {
	const { app, publisher } = await bootstrap();

	await startServer(app, publisher);
}

main();
