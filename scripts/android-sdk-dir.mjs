#!/usr/bin/env node
/**
 * Ensures android/local.properties contains sdk.dir so Gradle can locate the Android SDK.
 * Skips if sdk.dir is already set. Resolves from ANDROID_HOME, ANDROID_SDK_ROOT, or
 * default install paths when they contain platforms/ or build-tools/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const localPropsPath = path.join(root, "android", "local.properties");

function isSdkRoot(dir) {
	if (!dir || !fs.existsSync(dir)) return false;
	return (
		fs.existsSync(path.join(dir, "platforms")) ||
		fs.existsSync(path.join(dir, "build-tools"))
	);
}

function resolveSdkDir() {
	const home = process.env.HOME || process.env.USERPROFILE || "";
	const candidates = [
		process.env.ANDROID_HOME,
		process.env.ANDROID_SDK_ROOT,
		path.join(home, "Android", "Sdk"),
		path.join(home, "Library", "Android", "sdk"),
		path.join(home, "AppData", "Local", "Android", "Sdk"),
	].filter(Boolean);

	for (const c of candidates) {
		const resolved = path.resolve(c);
		if (isSdkRoot(resolved)) return resolved;
	}
	return null;
}

function main() {
	if (fs.existsSync(localPropsPath)) {
		const content = fs.readFileSync(localPropsPath, "utf8");
		if (/^\s*sdk\.dir\s*=/m.test(content)) return;
	}

	const sdkDir = resolveSdkDir();
	if (!sdkDir) {
		console.error(`Android SDK not found. Set ANDROID_HOME to your SDK root (with platforms/ or build-tools/), or create android/local.properties with:
  sdk.dir=/path/to/Android/sdk`);
		process.exit(1);
	}

	const line =
		process.platform === "win32"
			? `sdk.dir=${sdkDir.replace(/\\/g, "\\\\")}`
			: `sdk.dir=${sdkDir}`;

	fs.writeFileSync(localPropsPath, `${line}\n`, "utf8");
	console.error(`Wrote android/local.properties (${line})`);
}

main();
