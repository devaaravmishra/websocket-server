import { Redis } from "ioredis";
import { CONNECTION_COUNT_KEY, UPSTASH_REDIS_REST_URL } from "../config/config";

export function createRedisClients() {
	const publisher = new Redis(UPSTASH_REDIS_REST_URL || "");
	const subscriber = new Redis(UPSTASH_REDIS_REST_URL || "");

	return { publisher, subscriber };
}

export async function setupConnectedClients(publisher: Redis) {
	const currentCount = await publisher.get(CONNECTION_COUNT_KEY);

	if (!currentCount) {
		await publisher.set(CONNECTION_COUNT_KEY, 0);
	}
}

export async function getConnectedClients(publisher: Redis) {
	const currentCount = await publisher.get(CONNECTION_COUNT_KEY);

	return parseInt(currentCount || "0", 10);
}

export async function setConnectedClients(publisher: Redis, count: number) {
	await publisher.set(CONNECTION_COUNT_KEY, Math.max(count, 0));
}
