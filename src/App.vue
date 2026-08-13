<script setup>
import { onMounted } from 'vue'
import UnitToggler from '@/components/exercise/UnitToggler.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useLocationStore } from '@/stores/locationStore'

const weatherStore = useWeatherStore()
const locationStore = useLocationStore()

onMounted(() => {
  weatherStore.fetchAllWeather()
  locationStore.detectLocation()
})
</script>

<template>
  <div class="dashboard-wrapper">
    <h1 class="app-title">날씨 웹페이지
    </h1>
    <div class="topbar">
      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
        <RouterLink to="/map" class="nav-item">🗺️ 날씨 지도</RouterLink>
        <RouterLink to="/air" class="nav-item">🌫️ 대기질</RouterLink>
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
  background-color: #F9F9F9
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

.toggler-group {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

/* 알약형(pill) 세그먼트 네비게이션. exercise.css의 흰 배경/밑줄 스타일을 완전히 덮어쓴다 */
.navigation-bar {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;
  margin-bottom: 0;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(6px);
  box-shadow: none;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.nav-item:hover {
  color: var(--color-heading);
}

.nav-item.router-link-exact-active {
  background-color: #1a1a1a;
  color: #ffffff;
  border-bottom: none;
  padding-bottom: 8px;
  box-shadow: none;
}
</style>
