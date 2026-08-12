<script setup>
defineProps({
  city: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])
</script>

<template>
  <div
    class="weather-row"
    :class="{
      'is-selected': isSelected,
      'is-hot': city.temp >= 25,
      'is-cool': city.temp < 25,
    }"
    tabindex="0"
    @click="emit('select-card', city)"
    @keyup.enter="emit('select-card', city)"
  >
    <button type="button" class="favorite-btn" @click.stop="emit('toggle-favorite', city)">
      {{ city.isFavorite ? '⭐' : '☆' }}
    </button>

    <div class="weather-row__info">
      <p class="city-name">{{ city.name }} ({{ city.status }})</p>
      <p class="temp">현재 기온: {{ city.temp }}°C</p>

      <span v-if="city.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
      <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

      <p class="meta">💧 습도 {{ city.humidity }}% · 🌬️ 바람 {{ city.wind }}m/s</p>
    </div>

    <button class="detail-btn" @click.stop="emit('click-detail', city)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #eef2f7;
  border-radius: 12px;
  background: #fafcff;
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.weather-row:last-child {
  margin-bottom: 0;
}

.weather-row:hover,
.weather-row:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 139, 245, 0.14);
}

.weather-row.is-hot {
  background: linear-gradient(135deg, #fff6f4 0%, #ffe6e1 100%);
}

.weather-row.is-cool {
  background: linear-gradient(135deg, #f4f9ff 0%, #e7f1ff 100%);
}

.weather-row.is-selected {
  border-color: transparent;
}

.weather-row.is-selected.is-hot {
  border-color: #ff6b5b;
  box-shadow: 0 0 0 3px rgba(255, 107, 91, 0.35);
}

.weather-row.is-selected.is-cool {
  border-color: #4c8bf5;
  box-shadow: 0 0 0 3px rgba(76, 139, 245, 0.35);
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  padding: 4px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #f5a623;
}

.weather-row__info {
  text-align: left;
}

.city-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
}

.temp {
  margin: 0 0 8px;
  font-size: 14px;
  color: #4b5563;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.hot {
  background: #ffe3e0;
  color: #d1483a;
}

.badge.cool {
  background: #e0f0ff;
  color: #2a6fc9;
}

.meta {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9097a3;
}

.detail-btn {
  flex-shrink: 0;
  border: 1px solid #cfd8e3;
  background: #fff;
  color: #374151;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.detail-btn:hover {
  background: #4c8bf5;
  border-color: #4c8bf5;
  color: #fff;
}
</style>