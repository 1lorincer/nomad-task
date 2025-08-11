<script setup lang="ts">
import {Button, Menubar} from "primevue";
import {useRouter} from "vue-router";
import {useUserStore} from "../store/user.ts";

const router = useRouter()
const handleExit = () => {
  useUserStore().logout()
  router.push('/')
}
</script>

<template>
  <Menubar class="!py-5 !px-16">
    <template #start>
      <div class="text-2xl font-semibold">
        <router-link to="/">
          Nomad App
        </router-link>
      </div>
    </template>
    <template #end>
      <div v-if="useUserStore().isAuthed" class="flex gap-2">
        <Button
            @click="router.push('/orders')"
            class="w-28 md:w-36"
            severity="info"
        >
          Заказы
        </Button>
        <Button @click="handleExit" severity="danger" class="w-28 md:w-36 !text-white">
          Выйти
        </Button>
      </div>
      <div class="flex gap-2" v-else>
        <Button @click="router.push('/login')" severity="success" class="w-28 md:w-36">
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