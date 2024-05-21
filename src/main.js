import { createApp } from 'vue';
import App from './App.vue';

import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import SpeedDial from 'primevue/speeddial';
import Toast from 'primevue/toast';

import 'primevue/resources/themes/saga-blue/theme.css';     
import 'primevue/resources/primevue.min.css';                 
import 'primeicons/primeicons.css';       
import 'primeflex/primeflex.css';                     

const app = createApp(App);

app.use(PrimeVue);
app.use(ToastService);

app.component('SpeedDial', SpeedDial);
app.component('Toast', Toast);

app.mount('#app');
