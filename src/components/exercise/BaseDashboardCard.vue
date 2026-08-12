<template>
  <div class="dashboard-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.dashboard-card {
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(76, 139, 245, 0.06);
}
</style>
