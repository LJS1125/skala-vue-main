<script setup>
defineProps({
  sortOrder: {
    type: String,
    default: null,
  },
  showFavoritesOnly: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-sort-desc', 'toggle-sort-asc', 'toggle-favorites'])
</script>

<template>
  <div class="toolbar">
    <button
      type="button"
      class="sort-btn"
      :class="{ 'is-active': sortOrder === 'desc' }"
      @click="$emit('toggle-sort-desc')"
    >
      ▲ 높은 순
    </button>
    <button
      type="button"
      class="sort-btn"
      :class="{ 'is-active': sortOrder === 'asc' }"
      @click="$emit('toggle-sort-asc')"
    >
      ▼ 낮은 순
    </button>
    <button
      type="button"
      class="favorite-filter-btn"
      :class="{ 'is-active': showFavoritesOnly }"
      @click="$emit('toggle-favorites')"
    >
      ⭐ 즐겨찾기만 보기
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.sort-btn,
.favorite-filter-btn {
  border: 1px solid #cfd8e3;
  background: #fff;
  color: #374151;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.sort-btn.is-active,
.favorite-filter-btn.is-active {
  background: #4c8bf5;
  border-color: #4c8bf5;
  color: #fff;
}
</style>
