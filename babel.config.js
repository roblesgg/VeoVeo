/**
 * Configuración de Babel para el proyecto VeoVeo.
 * Utiliza el preset de Expo y el plugin de Reanimated para animaciones fluidas.
 */
module.exports = function (api) {
  // Caché activado para mejorar el rendimiento de la transpilación
  api.cache(true);
  
  return {
    // Preset base de Expo que maneja JS/TS y React Native
    presets: ['babel-preset-expo'],
    plugins: [
      // Requerido para react-native-reanimated (debe ser el último en la lista)
      'react-native-reanimated/plugin',
    ],
  };
};

