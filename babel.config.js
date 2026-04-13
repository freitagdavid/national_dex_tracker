const path = require("path");

module.exports = function (api) {
	api.cache(true);

	const projectRoot = path.resolve(__dirname);

	return {
		presets: ["babel-preset-expo"],

		plugins: [
			[
				"module-resolver",
				{
					// Anchor resolution to this repo. Alias must stay a *relative* `"./src"` string — using
					// `path.resolve(__dirname, "src")` here bakes `/tmp/.../absolute` paths into the graph,
					// which breaks EAS local builds when Metro resolves across different temp directories.
					root: [projectRoot],
					extensions: [".ios.js", ".android.js", ".js", ".jsx", ".json", ".tsx", ".ts"],
					alias: {
						"@": "./src",
					},
				},
			],
			"react-native-worklets/plugin",
		],
	};
};
