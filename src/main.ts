import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { initDatabase } from './services/database';

const app = createApp(App);

app.use(createPinia());
app.use(router);

async function bootstrap() {
  await initDatabase();
  app.mount('#app');
}

bootstrap();
