<script setup lang="ts">
import {Button, Menubar} from "primevue";
import {useRouter} from "vue-router";
const router = useRouter();
</script>

<template>
  <Menubar class="!py-5">
    <template #start>
      <div class="text-2xl font-semibold">
        <router-link to="/">
          Nomad App
        </router-link>
      </div>
    </template>
    <template #end>
      <div class="flex gap-2">
        <Button @click="router.push('/login')"  severity="success" class="w-28 md:w-36">
          Войти
        </Button>
        <Button @click="router.push('/signup')" severity="secondary" class="w-28 md:w-36">
          Регистрация
        </Button>
      </div>
    </template>
  </Menubar>
</template>

<style scoped>

</style>