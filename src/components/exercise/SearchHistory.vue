<script setup>
defineProps({
  history: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['apply-history', 'remove-history'])
</script>

<template>
  <div v-if="history.length" class="search-history">
    <button
      v-for="item in history"
      :key="item"
      type="button"
      class="history-badge"
      @click="$emit('apply-history', item)"
    >
      {{ item }}
      <span class="history-remove" @click.stop="$emit('remove-history', item)">✕</span>
    </button>
  </div>
</template>

<style scoped>
.search-history {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.history-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  padding: 5px 6px 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.history-badge:hover {
  background: #4c8bf5;
  border-color: #4c8bf5;
  color: #fff;
}

.history-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  color: inherit;
  opacity: 0.6;
}

.history-remove:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.12);
}
</style>
