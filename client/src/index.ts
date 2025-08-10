import {createApp} from 'vue';
import App from './App.vue';
import './assets/css/index.css';
import {routerConifg} from "./router";
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';

const app = createApp(App)
app.use(routerConifg)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ToastService);
app.mount('#root');
