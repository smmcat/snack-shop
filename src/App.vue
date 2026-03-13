<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

// 初始化用户状态
onMounted(() => {
  const userStore = useUserStore();
  userStore.initUser();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}
</style>