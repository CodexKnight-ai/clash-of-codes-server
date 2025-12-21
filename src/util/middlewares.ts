import { NextFunction } from "express";
import { Request, Response } from "express";
import {
	getCFSecretData,
	includesOrStartsWith,
	verifyServerToken,
} from "./functions";
import cookie from "cookie";
const envList = [
	"GOOGLE_CLIENT_SECRET",
	"GOOGLE_CLIENT_ID",
	"MONGO_URI",
	"JWT_SECRET",
	"REDIS_PASS",
	"REDIS_HOST",
	"MAX_RESULTS",
];

export async function verifyEnv() {
	const missingEnvVariables = envList.filter(
		(envVariable) => !process.env[envVariable]
	);
	if (missingEnvVariables.length > 0) {
		throw new Error(
			`Missing environment variables: ${missingEnvVariables.join(", ")}`
		);
	}

	// Check if CF credentials are configured in Redis
	// These are optional at startup and can be configured via /admin/cfConfig
	try {
		await getCFSecretData();
		console.log("Codeforces API credentials found in Redis");
	} catch (error) {
		console.warn("⚠️  Codeforces API credentials not configured in Redis.");
		console.warn("   Configure them via POST /admin/cfConfig to enable contest syncing.");
	}
}
const restricted = ["/admin", "/login"];

export async function auth(req: Request, res: Response, next: NextFunction) {
	let restricted2 = structuredClone(restricted);
	restricted2 = restricted2.filter((e) => e != "/login");
	if (!includesOrStartsWith(restricted2, req.path)) {
		next();
		return;
	}
	const token = req.cookies["server_token"];
	if (!token) {
		return res.status(401).send("unauthorized. no server token found");
	}

	const status = await verifyServerToken(token);

	if (!status) {
		return res.status(401).send("unauthorized. invalid token");
	}

	// console.log(payload);

	next(); // Call the next middleware in the stack
}

export function authToCookie(req: Request, res: Response, next: NextFunction) {
	let restricted2 = restricted.filter((e) => e != "/login");
	if (!includesOrStartsWith(restricted2, req.path)) {
		next();
		return;
	}
	if (!req.headers.auth) {
		return res.status(401).send("you must provide auth header");
	}
	req.cookies = cookie.parse(req.headers.auth as string);
	next();
}
