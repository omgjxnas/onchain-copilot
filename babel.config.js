module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-worklets/plugin powers Reanimated 4 worklets and must be last.
    plugins: ['react-native-worklets/plugin'],
  };
};
