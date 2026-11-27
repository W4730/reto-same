// Extiende app.json con lo que no puede ir en un JSON estático.
// GOOGLE_MAPS_ANDROID_KEY vive como variable de entorno de EAS (nunca en git):
//   npx eas-cli env:create --name GOOGLE_MAPS_ANDROID_KEY --value AIza... --environment preview --environment production --visibility sensitive
// En Expo Go no hace falta: Expo Go trae su propia clave.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_KEY ?? '' }],
  ],
});
