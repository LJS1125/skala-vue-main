<script setup>
import { onMounted } from 'vue'
import UnitToggler from '@/components/exercise/UnitToggler.vue'
import { useWeatherStore } from '@/stores/weatherStore'

const weatherStore = useWeatherStore()

onMounted(() => {
  weatherStore.fetchAllWeather()
})
</script>

<template>
  <div class="dashboard-wrapper">
    <h1 class="app-title">과제 6. Axios 활용</h1>
    <div class="topbar">
      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/map" class="nav-item">🗺️ 날씨 지도</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
      </nav>
      <div class="toggler-group">
        <UnitToggler />
      </div>
    </div>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/exercise.css';

/* main.css의 body/#app 규칙(과거 2단 웰컴 페이지용 display:flex + grid-template-columns 등)이
   1024px 이상 화면에서 .dashboard-wrapper를 절반 폭으로 눌러버리는 문제를 무력화 */
body {
  display: block;
}

#app {
  display: block;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

.app-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 16px;
  color: var(--color-heading);
}

.dashboard-wrapper {
  /* exercise.css의 고정 width:600px를 뷰포트에 반응하는 유동 너비로 재정의 */
  width: min(95%, 1320px);
  margin: 0 auto;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
  box-sizing: border-box;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  max-width: 1152px;
  width: 100%;
  margin: 0 auto 20px;
}

.topbar .navigation-bar {
  margin-bottom: 0;
  flex-wrap: wrap;
  row-gap: 8px;
}

.toggler-group {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* nav바(.navigation-bar)와 nav-item 텍스트는 exercise.css에서 흰 배경으로 하드코딩돼 있어
   다크모드에서도 CSS 변수를 따르도록 여기서 재정의 */
.navigation-bar {
  background-color: var(--color-background-soft);
}

.nav-item {
  color: var(--color-text);
}

.nav-item:hover {
  color: var(--color-heading);
}
</style>
