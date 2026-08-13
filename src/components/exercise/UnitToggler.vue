<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

const isFahrenheit = computed(() => configStore.unit === 'fahrenheit')
</script>

<template>
  <label class="toggle-switch">
    <span class="unit-label" :class="{ 'is-active': !isFahrenheit }">섭씨(℃)</span>
    <input
      type="checkbox"
      class="toggle-input"
      :checked="isFahrenheit"
      @change="configStore.toggleUnit"
    />
    <span class="toggle-track">
      <span class="toggle-thumb"></span>
    </span>
    <span class="unit-label" :class="{ 'is-active': isFahrenheit }">화씨(℉)</span>
  </label>
</template>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-heading);
}

.toggle-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.toggle-track {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  background: var(--color-border-hover);
  border-radius: 999px;
  transition: background-color 0.2s ease;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
}

.toggle-input:checked + .toggle-track {
  background: #4c8bf5;
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(18px);
}

.toggle-input:focus-visible + .toggle-track {
  outline: 2px solid #4c8bf5;
  outline-offset: 2px;
}

.unit-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text);
  transition:
    color 0.2s ease,
    font-weight 0.2s ease;
}

.unit-label.is-active {
  font-weight: 800;
  color: var(--color-heading);
}
</style>
