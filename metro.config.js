const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude build artifacts and other temporary folders from the file watcher
// to prevent ENOENT errors on Windows.
config.resolver.blockList = [
  /node_modules\/.*\/build\/.*/,
  /node_modules\/expo-modules-autolinking\/android\/.*/,
  /android\/build\/.*/,
];

module.exports = config;
