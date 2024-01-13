import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { createPinia } from 'pinia';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import App from './App.vue';
import 'vuetify/dist/vuetify.css';
import './index.css';

createApp(App)
    .use(createPinia())
    .use(createVuetify({
        icons: {
            defaultSet: "mdi",
            aliases,
            sets: {
                mdi,
            }
        }
    }))
    .mount('#app')
