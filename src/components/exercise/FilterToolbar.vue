<script setup>
const props = defineProps({
  sortOrder: {
    type: String,
    default: null,
  },
  showFavoritesOnly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:sortOrder', 'toggle-favorites'])

const handleSortChange = (value) => {
  emit('update:sortOrder', value === 'none' ? null : value)
}
</script>

<template>
  <div class="toolbar">
    <el-radio-group :model-value="props.sortOrder ?? 'none'" @change="handleSortChange">
      <el-radio-button value="none">전체</el-radio-button>
      <el-radio-button value="desc">▲ 높은 순</el-radio-button>
      <el-radio-button value="asc">▼ 낮은 순</el-radio-button>
      <el-radio-button value="favorite">⭐ 즐겨찾기 우선</el-radio-button>
    </el-radio-group>

    <el-button
      :type="showFavoritesOnly ? 'warning' : 'default'"
      :plain="!showFavoritesOnly"
      round
      @click="$emit('toggle-favorites')"
    >
      ⭐ 즐겨찾기만 보기
    </el-button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
</style>
