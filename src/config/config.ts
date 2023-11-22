import dotenv from "dotenv";
dotenv.config();

export const PORT = parseInt(process.env.PORT || "3002", 10);
export const HOST = process.env.HOST || "0.0.0.0";
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3001";
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

export const CONNECTION_COUNT_KEY = "chat:connection-count";
export const CONNECTION_COUNT_UPDATE_CHANNEL = "chat:connection-count-updated";
export const NEW_MESSAGE_CHANNEL = "chat:new-message";

export const CONVERSATION_MESSAGE_UPDATE_KEY = "CONVERSATION_MESSAGE_UPDATE";
export const CONVERSATION_MESSAGE_NEW_KEY = "CONVERSATION_MESSAGE_NEW";
export const CHANNEL_MESSAGE_UPDATE_KEY = "CHANNEL_MESSAGE_UPDATE";
export const CHANNEL_MESSAGE_NEW_KEY = "CHANNEL_MESSAGE_NEW";
export const CALL_IN_PROGRESS_KEY = "CALL_IN_PROGRESS";
export const OUTGOING_CALL_KEY = "OUTGOING_CALL";
export const MISSED_CALL_KEY = "MISSED_CALL";
export const MISSED_DIALLED_CALL_KEY = "MISSED_DIALLED_CALL";
export const ACCEPTED_CALL_KEY = "ACCEPTED_CALL";
export const REJECTED_CALL_KEY = "REJECTED_CALL";
export const CALL_ENDED_KEY = "CALL_ENDED";
