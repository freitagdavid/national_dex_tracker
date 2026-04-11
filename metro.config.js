const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { resolve } = require("metro-resolver");
const { withNativewind } = require("nativewind/metro");

const config = withNativewind(getDefaultConfig(__dirname), { inlineRem: 16 });

/** Delegate to Metro's core resolver (avoid recursive custom `resolveRequest`). */
function delegate(context, moduleName, platform) {
	return resolve(
		{
			...context,
			resolveRequest: resolve,
		},
		moduleName,
		platform,
	);
}

/**
 * Single web shim: Metro dedupes by resolved file path. Different per-component wrappers collapse
 * onto one module and break react-native-css (e.g. FlatList.js gets ScrollView only). This module
 * lazy-loads each RN-web export from dist/cjs/exports/* and provides TurboModuleRegistry for worklets.
 */
const RN_WEB_UNIFIED = path.join(__dirname, "metro-react-native-full-lazy.cjs");

// On web: map both `react-native` and react-native-web package main to the unified shim (not the
// RN-web CJS barrel). The barrel under Metro/Hermes can throw during circular init; separate
// resolutions per importer are merged by Metro so per-file wrappers are unsafe.
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (platform === "web" && moduleName === "react-native") {
		return delegate(context, RN_WEB_UNIFIED, platform);
	}
	if (
		platform === "web" &&
		(moduleName === "react-native-web" ||
			moduleName === "react-native-web/dist/index" ||
			moduleName === "react-native-web/dist/index.js")
	) {
		return delegate(context, RN_WEB_UNIFIED, platform);
	}
	return delegate(context, moduleName, platform);
};

module.exports = config;
