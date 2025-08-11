import {createApp} from 'vue';
import App from './App.vue';
import {createPinia} from "pinia";
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import {routerConifg} from "./router";
import './assets/css/index.css';

const app = createApp(App)
const pinia = createPinia()
app.use(routerConifg)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(pinia)

app.use(ToastService);
app.mount('#root');
