<template>
  <el-card class="dashboard-card" shadow="hover">
    <slot></slot>
  </el-card>
</template>

<style scoped>
.dashboard-card {
  border-radius: 18px;
  margin-bottom: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.dashboard-card :deep(.el-card__body) {
  padding: 24px;
}
</style>
