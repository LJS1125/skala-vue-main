// element-plus의 기본 CSS 변수(파란색 등)를 우리 팔레트로 덮어써야 하므로,
// element-plus CSS를 먼저 로드하고 main.css(우리 커스텀 변수)를 나중에 로드해 우선순위를 확보한다.
import 'element-plus/dist/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
