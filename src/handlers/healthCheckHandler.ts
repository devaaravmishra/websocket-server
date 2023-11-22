import { RouteHandler } from "fastify";
import { PORT } from "../config/config";

const healthCheckHandler: RouteHandler = () => {
	return { status: "ok", port: PORT, uptime: process.uptime() };
};

export default healthCheckHandler;
