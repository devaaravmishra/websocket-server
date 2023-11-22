import { FastifyInstance } from "fastify";
import healthCheckHandler from "../handlers/healthCheckHandler";

export default async function setupHealthCheckRoute(app: FastifyInstance) {
	app.get("/healthcheck", healthCheckHandler);
}
