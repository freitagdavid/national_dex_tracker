/**
 * Runs before expo-router/entry (see index.js).
 * #region agent log — session 17756d
 */
if (typeof window !== "undefined") {
	const endpoint =
		"http://127.0.0.1:7600/ingest/06cfe345-8dcf-4c64-a41f-dd6b261e2b74";
	const sessionId = "17756d";
	const send = (payload) => {
		fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Debug-Session-Id": sessionId,
			},
			body: JSON.stringify({
				sessionId,
				timestamp: Date.now(),
				...payload,
			}),
		}).catch(() => {});
	};

	send({
		runId: "bootstrap",
		hypothesisId: "H-B",
		location: "debug-bootstrap.js",
		message: "debug-bootstrap loaded before expo-router/entry",
		data: {
			pathname: window.location?.pathname,
			rootEl: document.getElementById("root")?.tagName ?? null,
		},
	});

	window.addEventListener("error", (e) => {
		send({
			runId: "global-error",
			hypothesisId: "H-A",
			location: "debug-bootstrap.js:error",
			message: "window.error",
			data: {
				msg: String(e.message),
				file: e.filename,
				line: e.lineno,
				col: e.colno,
				stack: e.error?.stack,
			},
		});
	});

	window.addEventListener("unhandledrejection", (e) => {
		const r = e.reason;
		send({
			runId: "global-rejection",
			hypothesisId: "H-A",
			location: "debug-bootstrap.js:unhandledrejection",
			message: "unhandledrejection",
			data: {
				reason: typeof r === "object" && r !== null ? String(r) : String(r),
				stack: r?.stack,
			},
		});
	});
}
// #endregion
