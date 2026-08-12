<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { weatherList } from '../data/weatherData.js'

const route = useRoute()

const city = computed(() => weatherList.find((c) => c.id === route.params.cityId) || null)

const checklistItems = computed(() => {
  if (!city.value) return []
  const { temp, status, humidity, wind } = city.value
  const items = []

  // 기온 기반
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
    items.push(
      {
        key: 'light_clothes',
        icon: '👕',
        label: '가벼운 옷차림',
        reason: '활동하기 좋은 포근한 날씨예요.',
        priority: 'recommended',
      },
      {
        key: 'handkerchief',
        icon: '🧻',
        label: '손수건',
        reason: '땀이 날 수 있어요.',
        priority: 'recommended',
      },
    )
  } else if (temp >= 20) {
    items.push({
      key: 'cardigan',
      icon: '🧶',
      label: '얇은 가디건',
      reason: '아침저녁으로 일교차가 있을 수 있어요.',
      priority: 'recommended',
    })
  } else if (temp >= 15) {
    items.push(
      {
        key: 'outerwear',
        icon: '🧥',
        label: '겉옷',
        reason: '쌀쌀한 날씨예요. 얇은 겉옷을 챙기세요.',
        priority: 'essential',
      },
      {
        key: 'warm_drink',
        icon: '☕',
        label: '따뜻한 음료',
        reason: '몸을 따뜻하게 데워보세요.',
        priority: 'recommended',
      },
    )
  } else {
    items.push(
      {
        key: 'thick_coat',
        icon: '🧥',
        label: '두꺼운 외투',
        reason: '기온이 많이 낮아요. 보온에 신경 쓰세요.',
        priority: 'essential',
      },
      {
        key: 'scarf',
        icon: '🧣',
        label: '목도리',
        reason: '목과 목덜미를 따뜻하게 지켜주세요.',
        priority: 'essential',
      },
    )
  }

  // 날씨 상태 기반
  if (status.includes('비')) {
    items.push(
      {
        key: 'umbrella',
        icon: '☔',
        label: '우산',
        reason: '오늘은 비 소식이 있어요. 우산을 꼭 챙기세요.',
        priority: 'essential',
      },
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

    <div v-if="city" class="checklist-card">
      <h2 class="checklist-title">🎒 {{ city.name }}, 오늘 이건 챙기세요</h2>
      <p class="checklist-condition">현재 {{ city.temp }}°C · {{ city.status }}</p>

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
  color: #4c8bf5;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.checklist-card {
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(76, 139, 245, 0.08);
}

.checklist-title {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 800;
  color: var(--color-heading);
}

.checklist-condition {
  margin: 0 0 18px;
  font-size: 13px;
  color: #6b7280;
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
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 16px;
  background: #fafcff;
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
  color: #1f2937;
}

.item-reason {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
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
  color: #9097a3;
  font-size: 13px;
  text-align: center;
}

.not-found {
  padding: 40px 0;
  text-align: center;
  color: #9097a3;
}
</style>
