import { registerRootComponent } from 'expo';
import App from './App';

// This forces Metro to correctly bundle all modules starting from the root App.
registerRootComponent(App);
