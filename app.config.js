// Carga .env antes de que Metro lea EXPO_PUBLIC_* (depuración en móvil con Expo Go).
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const appJson = require('./app.json');

const IS_TEST = process.env.APP_ENV === 'test';

module.exports = {
  ...appJson.expo,
  name: IS_TEST ? 'VeoVeoTest' : appJson.expo.name,
  android: {
    ...appJson.expo.android,
    package: IS_TEST ? 'com.roblesgg.veoveo.test' : appJson.expo.android.package,
  },
  scheme: IS_TEST ? 'veoveotest' : 'veoveo',
};
