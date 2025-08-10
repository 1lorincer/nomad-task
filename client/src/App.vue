<template>
  <div>
    <header-widget/>
    <main class="min-h-screen">
      <router-view></router-view>
    </main>
    <footer-widget/>
  </div>
</template>

<script setup lang="ts">

import HeaderWidget from "./components/header-widget.vue";
import FooterWidget from "./components/footer-widget.vue";
</script>

<style scoped>

</style>