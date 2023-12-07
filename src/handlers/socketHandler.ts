import { createAdapter } from "@socket.io/redis-adapter";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { Redis } from "ioredis";
import {
	ACCEPTED_CALL_KEY,
	CALL_ENDED_KEY,
	CALL_IN_PROGRESS_KEY,
	CHANNEL_MESSAGE_NEW_KEY,
	CHANNEL_MESSAGE_UPDATE_KEY,
	CONNECTION_COUNT_KEY,
	CONNECTION_COUNT_UPDATE_CHANNEL,
	CONVERSATION_MESSAGE_NEW_KEY,
	CONVERSATION_MESSAGE_UPDATE_KEY,
	MISSED_CALL_KEY,
	MISSED_DIALLED_CALL_KEY,
	NEW_MESSAGE_CHANNEL,
	OUTGOING_CALL_KEY,
	PORT,
	PROFILE_ACTIVE_STATUS,
	REJECTED_CALL_KEY,
} from "../config/config";
import ConnectedClients from "../utils/ConnectedClients";

export async function setupSocketHandler(app: FastifyInstance, publisher: Redis, subscriber: Redis) {
	const connectedClients = new ConnectedClients();

	app.io.adapter(createAdapter(publisher, subscriber));

	app.io.on("connection", async (io) => {
		console.log("Client connected", io.id);

		const incResult = await publisher.incr(CONNECTION_COUNT_KEY);

		connectedClients.increment();

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
			connectedClients.decrement();

			const decrResult = await publisher.decr(CONNECTION_COUNT_KEY);

			publisher.publish(CONNECTION_COUNT_UPDATE_CHANNEL, String(decrResult));
		});

		io.on("typing", (data) => {
			io.broadcast.emit("typing", data);
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

	subscriber.subscribe(CONVERSATION_MESSAGE_NEW_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${CONVERSATION_MESSAGE_NEW_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${CONVERSATION_MESSAGE_NEW_KEY}`);
	});

	subscriber.subscribe(CONVERSATION_MESSAGE_UPDATE_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${CONVERSATION_MESSAGE_UPDATE_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${CONVERSATION_MESSAGE_UPDATE_KEY}`);
	});

	subscriber.subscribe(CHANNEL_MESSAGE_NEW_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${CHANNEL_MESSAGE_NEW_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${CHANNEL_MESSAGE_NEW_KEY}`);
	});

	subscriber.subscribe(CHANNEL_MESSAGE_UPDATE_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${CHANNEL_MESSAGE_UPDATE_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${CHANNEL_MESSAGE_UPDATE_KEY}`);
	});

	subscriber.subscribe(CALL_IN_PROGRESS_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${CALL_IN_PROGRESS_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${CALL_IN_PROGRESS_KEY}`);
	});

	subscriber.subscribe(OUTGOING_CALL_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${OUTGOING_CALL_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${OUTGOING_CALL_KEY}`);
	});

	subscriber.subscribe(MISSED_CALL_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${MISSED_CALL_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${MISSED_CALL_KEY}`);
	});

	subscriber.subscribe(MISSED_DIALLED_CALL_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${MISSED_DIALLED_CALL_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${MISSED_DIALLED_CALL_KEY}`);
	});

	subscriber.subscribe(ACCEPTED_CALL_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${ACCEPTED_CALL_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${ACCEPTED_CALL_KEY}`);
	});

	subscriber.subscribe(REJECTED_CALL_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${REJECTED_CALL_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${REJECTED_CALL_KEY}`);
	});

	subscriber.subscribe(CALL_ENDED_KEY, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${CALL_ENDED_KEY}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${CALL_ENDED_KEY}`);
	});

	subscriber.subscribe(PROFILE_ACTIVE_STATUS, (err, count) => {
		if (err) {
			console.error(`Error subscribing to channel ${PROFILE_ACTIVE_STATUS}`, err);
			return;
		}

		console.log(`${count} clients subscribed to channel ${PROFILE_ACTIVE_STATUS}`);
	});

	subscriber.on("message", (channel, text) => {
		console.log("channel", channel, "text", text);

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

		if (channel === CONVERSATION_MESSAGE_NEW_KEY) {
			const { conversationId, message } = JSON.parse(text);

			const messageKey = `chat:${conversationId}:messages`;

			app.io.emit(messageKey, message);

			return;
		}

		if (channel === CONVERSATION_MESSAGE_UPDATE_KEY) {
			const { conversationId, directMessage } = JSON.parse(text);

			const updateKey = `chat:${conversationId}:messages:update`;

			app.io.emit(updateKey, directMessage);

			return;
		}

		if (channel === CHANNEL_MESSAGE_NEW_KEY) {
			const { channelId, message } = JSON.parse(text);

			const messageKey = `chat:${channelId}:messages`;

			app.io.emit(messageKey, message);

			return;
		}

		if (channel === CHANNEL_MESSAGE_UPDATE_KEY) {
			const { channelId, message } = JSON.parse(text);

			const updateKey = `chat:${channelId}:messages:update`;

			app.io.emit(updateKey, message);

			return;
		}

		if (channel === CALL_IN_PROGRESS_KEY) {
			const { conversationId, callerId, serverId } = JSON.parse(text);

			const callKey = `ongoing-call-${conversationId}`;

			app.io.emit(callKey, {
				conversationId,
				callerId,
				serverId,
			});

			return;
		}

		if (channel === OUTGOING_CALL_KEY) {
			const { call, callId, callerId, caller, conversationId, calleeId, callerMemberId, calleeMemberId, serverId } = JSON.parse(text);

			const outGoingCallKey = `outgoing-call-${calleeId}`;

			app.io.emit(outGoingCallKey, {
				call,
				conversationId,
				callerId,
				caller,
				callId,
				callerMemberId,
				calleeMemberId,
				serverId,
			});

			return;
		}

		if (channel === MISSED_CALL_KEY) {
			const { conversationId, calleeId, callId, serverId } = JSON.parse(text);

			const missedCallKey = `missed-call-${calleeId}`;

			app.io.emit(missedCallKey, {
				conversationId,
				calleeId,
				callId,
				serverId,
			});

			return;
		}

		if (channel === MISSED_DIALLED_CALL_KEY) {
			const { conversationId, callerId, callId, serverId } = JSON.parse(text);

			const missedCallKeyForCaller = `missed-dialled-call-${callerId}`;

			app.io.emit(missedCallKeyForCaller, {
				conversationId,
				callId,
				callerId,
				serverId,
			});

			return;
		}

		if (channel === ACCEPTED_CALL_KEY) {
			const { conversationId, callerId, callId, serverId, callerMemberId, calleeMemberId } = JSON.parse(text);

			const acceptedCallKey = `accepted-call-${callerId}`;

			app.io.emit(acceptedCallKey, {
				conversationId,
				callerId,
				callId,
				serverId,
				callerMemberId,
				calleeMemberId,
			});

			return;
		}

		if (channel === REJECTED_CALL_KEY) {
			const { conversationId, callerId, callId, serverId } = JSON.parse(text);

			const rejectedCallKey = `rejected-call-${callerId}`;

			app.io.emit(rejectedCallKey, {
				conversationId,
				callerId,
				callId,
				serverId,
			});

			return;
		}

		if (channel === CALL_ENDED_KEY) {
			const { conversationId, callerId, calleeId, callId, serverId, endedByCaller } = JSON.parse(text);

			const calleeOrCallerId = endedByCaller ? calleeId : callerId;
			const callEndedKey = `ended-call-${calleeOrCallerId}`;

			app.io.emit(callEndedKey, {
				conversationId,
				callerId,
				calleeId,
				callId,
				serverId,
			});

			return;
		}

		if (channel === PROFILE_ACTIVE_STATUS) {
			const updatedProfile = JSON.parse(text);

			const profileActiveStatusKey = `active-status-${updatedProfile.id}`;

			app.io.emit(profileActiveStatusKey, updatedProfile);

			return;
		}
	});
}
