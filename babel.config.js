const path = require("path");

module.exports = function (api) {
	api.cache(true);

	const srcPath = path.resolve(__dirname, "src");

	return {
		presets: ["babel-preset-expo"],

		plugins: [
			[
				"module-resolver",
				{
					// Absolute paths so `@/*` always maps to `./src/*` no matter which file imports
					// (e.g. `app/*.tsx`). Relative `./src` can be resolved from the wrong cwd and
					// turn into `../components/...` from `app/`, which does not exist.
					root: [path.resolve(__dirname)],
					extensions: [".ios.js", ".android.js", ".js", ".jsx", ".json", ".tsx", ".ts"],
					alias: {
						"@": srcPath,
					},
				},
			],
			"react-native-worklets/plugin",
		],
	};
};
