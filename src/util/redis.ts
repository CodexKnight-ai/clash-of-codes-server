import { createClient } from "redis";

// Create a Redis client
const client = createClient({
	password: process.env.REDIS_PASS,
	socket: {
		host: process.env.REDIS_HOST,
		port: 13800,
	},
});

// Connect to Redis and handle connection events
export function connectToRedis() {
	client.connect();
	client.on("error", (error: Error) => {
		console.error("Failed to connect to Redis! " + error);
	});
	client.on("connect", () => {
		console.log("Connected to Redis");
	});
}

// Get the existing Redis client
export function getRedisClient() {
	return client;
}

// Create and return a new Redis client
export function getNewRedisClient() {
	const newClient = createClient({
		password: process.env.REDIS_PASS,
		socket: {
			host: process.env.REDIS_HOST,
			port: 13800,
		},
	});
	return newClient;
}
