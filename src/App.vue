<template>
  <div class="dashboard-wrapper">
    <h1 class="app-title">과제 4. Vue Router 적용</h1>
    <nav class="navigation-bar">
      <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/map" class="nav-item">🗺️ 날씨 지도</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/exercise.css';

.app-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 16px;
  color: var(--color-heading);
}
</style>
