<template>
  <div>
    <header-widget/>
    <router-view></router-view>
    <footer-widget/>
  </div>
</template>

<script setup lang="ts">

import HeaderWidget from "./components/header-widget.vue";
import FooterWidget from "./components/footer-widget.vue";
</script>

<style scoped>

</style>