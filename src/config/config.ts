import dotenv from "dotenv";
dotenv.config();

export const PORT = parseInt(process.env.PORT || "3002", 10);
export const HOST = process.env.HOST || "0.0.0.0";
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3001";
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

export const CONNECTION_COUNT_KEY = "chat:connection-count";
export const CONNECTION_COUNT_UPDATE_CHANNEL = "chat:connection-count-updated";
export const NEW_MESSAGE_CHANNEL = "chat:new-message";
