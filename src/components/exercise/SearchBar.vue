<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

defineEmits(['update-query'])
</script>

<template>
  <div>
    <h3 class="section-title">🔍 도시 검색</h3>
    <input
      class="search-input"
      type="text"
      placeholder="검색할 도시 이름 입력"
      :value="searchQuery"
      @input="$emit('update-query', $event.target.value)"
    />
    <p class="search-echo">검색 중인 도시: {{ searchQuery }}</p>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 14px;
  color: #2a5cd8;
}

.search-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #4c8bf5;
  box-shadow: 0 0 0 3px rgba(76, 139, 245, 0.15);
}

.search-echo {
  margin: 10px 0 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
