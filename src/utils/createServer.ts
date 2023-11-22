import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import { CORS_ORIGIN } from "../config/config";

export default async function createServer() {
	const app = fastify();

	await app.register(fastifyCors, {
		origin: CORS_ORIGIN,
	});

	await app.register(fastifyIO);

	return app;
}
