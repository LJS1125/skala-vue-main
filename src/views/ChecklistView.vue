<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'
import { useAirQualityStore } from '@/stores/airQualityStore'
import { getLifestyleIndices } from '@/utils/lifestyleIndex'
import { getWeatherLabel } from '@/utils/weatherLabel'

const route = useRoute()
const weatherStore = useWeatherStore()
const airQualityStore = useAirQualityStore()

onMounted(() => {
  airQualityStore.fetchAllAirQuality()
})

const city = computed(
  () => weatherStore.weatherList.find((c) => c.id === route.params.cityId) || null,
)

const airGrade = computed(() => airQualityStore.getGradeByCityId(route.params.cityId))

// 옷차림/우산 여부는 생활 지수 요약이 대표하므로, 체크리스트는 그 외 보조 준비물만 다룬다
const lifestyle = computed(() => getLifestyleIndices(city.value, airGrade.value))

const checklistItems = computed(() => {
  if (!city.value) return []
  const { temp, status, humidity, wind } = city.value
  const items = []

  // 기온 기반 보조 준비물 (옷차림 자체는 상단 생활 지수 요약이 대표하므로 제외)
  if (temp >= 28) {
    items.push(
      {
        key: 'sunscreen',
        icon: '🧴',
        label: '자외선 차단제',
        reason: '자외선이 강해요. 외출 30분 전에 발라주세요.',
        priority: 'essential',
      },
      {
        key: 'water_bottle',
        icon: '💧',
        label: '물병',
        reason: '더위에 땀을 많이 흘려요. 수분을 충분히 챙기세요.',
        priority: 'essential',
      },
      {
        key: 'sunglasses',
        icon: '🕶️',
        label: '선글라스',
        reason: '햇빛이 강할 수 있어요. 눈부심을 줄여보세요.',
        priority: 'recommended',
      },
      {
        key: 'hat',
        icon: '🧢',
        label: '모자',
        reason: '뜨거운 햇볕을 막아줘요.',
        priority: 'recommended',
      },
    )
  } else if (temp >= 25) {
    items.push({
      key: 'handkerchief',
      icon: '🧻',
      label: '손수건',
      reason: '땀이 날 수 있어요.',
      priority: 'recommended',
    })
  } else if (temp >= 15) {
    items.push({
      key: 'warm_drink',
      icon: '☕',
      label: '따뜻한 음료',
      reason: '몸을 따뜻하게 데워보세요.',
      priority: 'recommended',
    })
  } else {
    items.push({
      key: 'gloves',
      icon: '🧤',
      label: '장갑',
      reason: '기온이 많이 낮아요. 손을 따뜻하게 보호하세요.',
      priority: 'recommended',
    })
  }

  // 날씨 상태 기반 (우산 자체는 상단 생활 지수 요약이 대표하므로 제외)
  if (status.includes('비')) {
    items.push(
      {
        key: 'waterproof_shoes',
        icon: '👟',
        label: '방수 신발',
        reason: '빗길에 신발이 젖지 않게 도와줘요.',
        priority: 'recommended',
      },
      {
        key: 'extra_socks',
        icon: '🧦',
        label: '여분 양말',
        reason: '혹시 발이 젖어도 바로 갈아 신을 수 있어요.',
        priority: 'recommended',
      },
    )
  }
  if (status.includes('눈')) {
    items.push(
      {
        key: 'snow_shoes',
        icon: '🥾',
        label: '미끄럼 방지 신발',
        reason: '눈길은 미끄러워요. 안전한 신발을 신으세요.',
        priority: 'essential',
      },
      {
        key: 'gloves',
        icon: '🧤',
        label: '장갑',
        reason: '눈 오는 날은 손이 더 시려워요.',
        priority: 'recommended',
      },
    )
  }
  if (status.includes('맑음')) {
    items.push({
      key: 'sunglasses',
      icon: '🕶️',
      label: '선글라스',
      reason: '햇빛이 강할 수 있어요. 눈부심을 줄여보세요.',
      priority: 'recommended',
    })
  }

  // 습도 기반
  if (humidity >= 80) {
    items.push({
      key: 'extra_shirt',
      icon: '👚',
      label: '여분 티셔츠',
      reason: '습도가 높아 땀이 잘 마르지 않아요.',
      priority: 'recommended',
    })
  }
  if (humidity <= 30) {
    items.push(
      {
        key: 'lip_balm',
        icon: '💄',
        label: '립밤',
        reason: '건조한 공기에 입술이 트기 쉬워요.',
        priority: 'recommended',
      },
      {
        key: 'hand_cream',
        icon: '🧴',
        label: '핸드크림',
        reason: '손이 건조해지지 않게 관리해주세요.',
        priority: 'recommended',
      },
    )
  }

  // 바람 기반
  if (wind >= 5) {
    items.push(
      {
        key: 'windbreaker',
        icon: '🧥',
        label: '바람막이',
        reason: '바람이 강해요. 체온이 떨어지지 않게 챙기세요.',
        priority: 'recommended',
      },
      {
        key: 'hat_wind_caution',
        icon: '💨',
        label: '모자 날림 주의',
        reason: '바람이 강해요. 모자를 쓰셨다면 날아가지 않게 주의하세요.',
        priority: 'recommended',
      },
    )
  }

  // key 기준 중복 제거 (먼저 나온 항목 우선)
  const deduped = [...new Map(items.map((item) => [item.key, item])).values()]

  // 필수 항목을 먼저, 그 다음 권장 항목 순으로 정렬 (그룹 내 순서는 유지)
  const priorityRank = { essential: 0, recommended: 1 }
  return deduped
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const rankDiff = priorityRank[a.item.priority] - priorityRank[b.item.priority]
      return rankDiff !== 0 ? rankDiff : a.index - b.index
    })
    .map(({ item }) => item)
})
</script>

<template>
  <div class="checklist-page">
    <RouterLink to="/" class="back-link">← 메인으로 돌아가기</RouterLink>

    <p v-if="weatherStore.isLoading" class="empty-msg">⏳ 날씨 정보를 불러오는 중입니다...</p>
    <p v-else-if="weatherStore.error" class="empty-msg">{{ weatherStore.error }}</p>

    <div v-else-if="city" class="checklist-card">
      <h2 class="checklist-title">🎒 {{ city.name }}, 오늘 이건 챙기세요</h2>
      <p class="checklist-condition">현재 {{ city.temp }}°C · {{ getWeatherLabel(city.icon) }}</p>

      <p v-if="lifestyle" class="lifestyle-row">
        {{ lifestyle.clothing.icon }} {{ lifestyle.clothing.label }} ·
        {{ lifestyle.umbrella.icon }} {{ lifestyle.umbrella.label }} ·
        {{ lifestyle.discomfort.icon }} {{ lifestyle.discomfort.label }}
        <template v-if="lifestyle.mask"> · {{ lifestyle.mask.icon }} {{ lifestyle.mask.label }}</template>
      </p>

      <p class="section-label">그 외 챙기면 좋은 준비물</p>

      <ul v-if="checklistItems.length > 0" class="item-list">
        <li v-for="item in checklistItems" :key="item.key" class="item-card">
          <span class="item-icon">{{ item.icon }}</span>
          <div class="item-body">
            <div class="item-heading">
              <p class="item-label">{{ item.label }}</p>
              <span class="badge" :class="`badge-${item.priority}`">
                {{ item.priority === 'essential' ? '필수' : '권장' }}
              </span>
            </div>
            <p class="item-reason">{{ item.reason }}</p>
          </div>
        </li>
      </ul>

      <p v-else class="empty-msg">오늘은 특별히 챙길 게 없어요. 가볍게 다녀오세요!</p>
    </div>

    <div v-else class="not-found">
      <p>해당 도시 정보를 찾을 수 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.checklist-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-heading);
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.checklist-card {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  background: var(--color-background-soft);
  box-shadow: 0 2px 10px rgba(76, 139, 245, 0.08);
}

.checklist-title {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 800;
  color: var(--color-heading);
}

.checklist-condition {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--color-text);
}

.lifestyle-row {
  margin: 0 0 18px;
  padding: 10px 14px;
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border);
  border-radius: 10px;
  color: var(--color-accent-text);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.section-label {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text);
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 14px 16px;
  background: var(--color-background-mute);
}

.item-icon {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}

.item-body {
  flex: 1;
  min-width: 0;
}

.item-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.item-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-heading);
}

.item-reason {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text);
}

.badge {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.badge-essential {
  background: #ffe3e0;
  color: #d1483a;
}

.badge-recommended {
  background: #eef1f5;
  color: #6b7280;
}

.empty-msg {
  padding: 16px;
  color: var(--color-text);
  font-size: 13px;
  text-align: center;
}

.not-found {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text);
}
</style>
