<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { getWeatherLabel } from '@/utils/weatherLabel'
import { getTempAccentColor, getTempAccentLabel } from '@/utils/tempColor'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  // 내 위치 카드 / 자유 검색 카드처럼 목록 선택 동작이 필요 없는 경우 false로 전달
  interactive: {
    type: Boolean,
    default: true,
  },
  showFavorite: {
    type: Boolean,
    default: undefined,
  },
  showDetail: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

const configStore = useConfigStore()

const toDisplayTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const resolvedShowFavorite = computed(() =>
  props.showFavorite === undefined ? props.interactive : props.showFavorite,
)

const accentColor = computed(() => getTempAccentColor(props.city.temp))
const weatherLabel = computed(() => getWeatherLabel(props.city.icon))
const tempAccentLabel = computed(() => getTempAccentLabel(props.city.temp))
const iconUrl = computed(() =>
  props.city.icon ? `https://openweathermap.org/img/wn/${props.city.icon}@2x.png` : '',
)
</script>

<template>
  <el-card
    class="weather-card"
    :class="{ 'is-selected': isSelected, 'is-static': !interactive }"
    :style="{ borderLeftColor: accentColor }"
    shadow="hover"
  >
    <div
      class="weather-row"
      :tabindex="interactive ? 0 : -1"
      @click="interactive && emit('select-card', city)"
      @keyup.enter="interactive && emit('select-card', city)"
    >
      <div class="weather-row__info">
        <div class="city-name-row">
          <p class="city-name">{{ city.name }}</p>
          <el-button
            v-if="resolvedShowFavorite"
            class="favorite-btn"
            circle
            text
            @click.stop="emit('toggle-favorite', city)"
          >
            {{ city.isFavorite ? '⭐' : '☆' }}
          </el-button>
        </div>

        <div class="icon-temp-row">
          <img v-if="iconUrl" :src="iconUrl" class="status-icon" :alt="city.status" />
          <p class="temp-big">{{ toDisplayTemp(city.temp) }}{{ configStore.unitSymbol }}</p>
        </div>

        <p class="status-line" :style="{ color: accentColor }">
          {{ weatherLabel }} · {{ tempAccentLabel }}
        </p>
      </div>

      <el-button v-if="showDetail" class="detail-btn" @click.stop="emit('click-detail', city)">
        상세보기
      </el-button>
    </div>

    <div v-if="$slots.extra" class="weather-row__extra">
      <slot name="extra" />
    </div>
  </el-card>
</template>

<style scoped>
.weather-card {
  position: relative;
  margin-bottom: 12px;
  border-radius: var(--radius-card, 16px);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-border);
  background: var(--color-background-soft);
  transition: transform 0.15s ease;
}

.weather-card :deep(.el-card__body) {
  padding: 0;
}

.weather-card:last-child {
  margin-bottom: 0;
}

.weather-card:hover {
  transform: translateY(-2px);
}

.weather-card.is-selected {
  border-color: var(--color-heading);
  box-shadow: 0 0 0 2px var(--color-heading);
}

.weather-card.is-static:hover {
  transform: none;
}

.weather-card.is-static .weather-row {
  cursor: default;
}

.weather-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  cursor: pointer;
  outline: none;
}

.weather-row__info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.city-name-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}

.city-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading);
}

.favorite-btn {
  font-size: 16px;
  padding: 2px;
  height: auto;
}

.icon-temp-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.status-icon {
  width: 28px;
  height: 28px;
  margin-left: -4px;
}

.temp-big {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-heading);
}

.status-line {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

.detail-btn {
  flex-shrink: 0;
}

.weather-row__extra {
  padding: 14px 18px 18px;
  border-top: 1px solid var(--color-border);
}
</style>
