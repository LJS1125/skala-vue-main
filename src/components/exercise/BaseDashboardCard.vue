<template>
  <div class="dashboard-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.dashboard-card {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  background: var(--color-background-soft);
  box-shadow: 0 2px 10px rgba(76, 139, 245, 0.06);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}
</style>
