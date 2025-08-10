<template>
  <div>
    <Toast position="top-right" />
    <header-widget/>
    <main class="min-h-screen px-16 py-10">
      <router-view></router-view>
    </main>
    <footer-widget/>
  </div>
</template>

<script setup lang="ts">

import Toast from 'primevue/toast';
import HeaderWidget from "./components/header-widget.vue";
import FooterWidget from "./components/footer-widget.vue";

</script>

<style scoped>

</style>