<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { weatherList } from '../data/weatherData.js'

const route = useRoute()

const city = computed(() => weatherList.find((c) => c.id === route.params.cityId) || null)

const checklistItems = computed(() => {
  if (!city.value) return []
  const { status, temp } = city.value
  const items = []
  if (status.includes('비')) items.push({ key: 'umbrella', label: '☔ 우산' })
  if (temp < 20) items.push({ key: 'jacket', label: '🧥 얇은 겉옷' })
  if (temp >= 28) items.push({ key: 'sunscreen', label: '🧴 자외선 차단제' })
  return items
})

const checkedMap = ref({})

const totalCount = computed(() => checklistItems.value.length)
const checkedCount = computed(
  () => checklistItems.value.filter((item) => checkedMap.value[item.key]).length,
)
</script>

<template>
  <div class="checklist-page">
    <RouterLink to="/" class="back-link">← 메인으로 돌아가기</RouterLink>

    <div v-if="city" class="checklist-card">
      <h2 class="checklist-title">🎒 {{ city.name }}, 오늘 뭐 챙길까요?</h2>
      <p class="checklist-condition">현재 {{ city.temp }}°C · {{ city.status }}</p>

      <p v-if="totalCount > 0" class="progress-text">
        {{ checkedCount }}/{{ totalCount }} 준비 완료!
      </p>

      <ul v-if="totalCount > 0" class="checklist-list">
        <li v-for="item in checklistItems" :key="item.key" class="checklist-item">
          <label>
            <input type="checkbox" v-model="checkedMap[item.key]" />
            {{ item.label }}
          </label>
        </li>
      </ul>

      <p v-else class="empty-msg">오늘은 특별히 챙길 게 없어요!</p>
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
  color: #1f2937;
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
}

.checklist-condition {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;
}

.progress-text {
  margin: 0 0 14px;
  padding: 10px 14px;
  background: #eaf6ee;
  border: 1px solid #cfe8d8;
  border-radius: 10px;
  color: #2f7a4d;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
}

.checklist-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checklist-item {
  border: 1px solid #eef2f7;
  border-radius: 10px;
  padding: 12px 14px;
  background: #fafcff;
}

.checklist-item label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.checklist-item input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
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
