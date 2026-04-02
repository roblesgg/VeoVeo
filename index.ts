import { registerRootComponent } from 'expo';
import { RootNavigator } from './src/navigation/RootNavigator';

// registerRootComponent hace que el componente principal se ejecute
// correctamente tanto en Expo Go como en builds nativos.
registerRootComponent(RootNavigator);
