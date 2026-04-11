const path = require("path");

module.exports = function (api) {
  api.cache(true);

  return {
    // nativewind/babel rewrites RN-web imports (including relative paths under
    // `react-native-web/dist`) to `react-native-css/components/*`, which breaks RN-web internals
    // (e.g. FlatList → vendor FlatList). Our Metro shims must also stay untransformed.
    ignore: [
      (filepath) => {
        if (typeof filepath !== "string") return false;
        return (
          filepath.includes(`${path.sep}node_modules${path.sep}react-native-web${path.sep}`) ||
          filepath.includes(`${path.sep}metro-rnw-primitives${path.sep}`) ||
          filepath.endsWith(`${path.sep}metro-react-native-full-lazy.cjs`)
        );
      },
    ],

    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './src',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      // react-native-worklets/plugin is already appended by babel-preset-expo when
      // react-native-reanimated v4+ is installed; listing it again breaks transforms.
    ],
  };
};
