<script setup>
import { useVisitStore } from '@/stores/visitStore'

const visitStore = useVisitStore()

const features = [
  {
    icon: '🔍',
    title: '도시별 날씨 한눈에 보기',
    desc: '검색, 정렬, 즐겨찾기로 원하는 도시의 날씨를 빠르게 확인하세요.',
  },
  {
    icon: '📈',
    title: '시간대별 기온 변화 확인',
    desc: '오늘의 여정에서 하루 동안의 기온 흐름을 살펴보세요.',
  },
  {
    icon: '🎒',
    title: '날씨 맞춤 준비물 체크리스트',
    desc: '우산, 겉옷, 자외선 차단제까지 오늘 챙길 것을 알려드려요.',
  },
  {
    icon: '🗺️',
    title: '지도로 보는 전국 날씨',
    desc: '지도 위에서 전국 도시의 날씨를 한눈에 비교해보세요.',
  },
]

const usageTips = [
  '도시 카드의 상세보기를 누르면 하루 기온 변화를 볼 수 있어요.',
  '상세 페이지의 "오늘 뭐 챙길까요?" 버튼으로 준비물 체크리스트로 이동해요.',
  '지도에서 도시 점을 클릭하면 바로 상세 페이지로 이동해요.',
]
</script>

<template>
  <div class="about-page">
    <h2 class="about-title">ℹ️ 서비스 소개</h2>
    <p class="tagline">
      전국 도시의 날씨를 한눈에 확인하고, 오늘 뭘 챙겨야 할지까지 알려주는 날씨 대시보드예요.
    </p>

    <ul class="feature-grid">
      <li v-for="feature in features" :key="feature.title">
        <el-card class="feature-card" shadow="hover">
          <span class="feature-icon">{{ feature.icon }}</span>
          <p class="feature-title">{{ feature.title }}</p>
          <p class="feature-desc">{{ feature.desc }}</p>
        </el-card>
      </li>
    </ul>

    <section class="usage-section">
      <h3 class="usage-title">💡 이렇게 사용해보세요</h3>
      <ul class="usage-list">
        <li v-for="tip in usageTips" :key="tip">{{ tip }}</li>
      </ul>
    </section>

    <p v-if="visitStore.totalVisits > 0" class="visit-stat">
      📊 지금까지 총 {{ visitStore.totalVisits }}번 상세정보를 확인하셨어요
    </p>

    <footer class="dev-info">
      <h4 class="dev-info-title">개발 정보</h4>
      <p class="dev-info-stack">Vue 3 · Vue Router 4 · Vite</p>
    </footer>

    <RouterLink to="/" class="home-btn">메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  background: var(--color-background);
  color: var(--color-text);
}

.about-title {
  margin: 0 0 8px;
  color: var(--color-heading);
}

.tagline {
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
}

.feature-grid {
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card, 16px);
  background: var(--color-background-soft);
  text-align: center;
  transition: transform 0.15s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.feature-card :deep(.el-card__body) {
  padding: 16px;
}

.feature-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 8px;
}

.feature-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-heading);
}

.feature-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text);
}

.usage-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card, 16px);
  padding: 16px 18px;
  background: var(--color-background-soft);
  margin-bottom: 24px;
}

.usage-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-accent-text);
}

.usage-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--color-text);
}

.visit-stat {
  margin: 0 0 20px;
  padding: 10px 14px;
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border);
  border-radius: 10px;
  color: var(--color-accent-text);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.dev-info {
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
  margin-bottom: 20px;
}

.dev-info-title {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text);
}

.dev-info-stack {
  margin: 0;
  font-size: 12px;
  color: var(--color-text);
}

.home-btn {
  display: block;
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  background-color: var(--color-accent-text);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.home-btn:hover {
  background-color: var(--el-color-primary-dark-2, #26649b);
}
</style>
