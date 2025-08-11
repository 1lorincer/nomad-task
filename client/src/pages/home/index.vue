<script setup lang="ts">
import {onMounted} from 'vue'
import {Card, Tag, Button, Skeleton} from 'primevue'
import {useProducts} from "../../composables/useProducts.ts";
import {money} from "../../utils/money.ts";
import CreateProduct from "../../components/create-product.vue";
import EditProduct from "../../components/edit-product.vue";

const {
  products, isLoading, error,
  createOpen, createDraft,
  editOpen, editDraft, saving,
  deletingId, isAdmin,

  getProducts, handleCreate, resetDraft,
  openEdit, handleUpdate, resetEdit,
  handleRemove,
  creatingOrderId,
  createOrderForProduct
} = useProducts()

onMounted(getProducts)
</script>

<template>
  <div class="space-y-6">
    <create-product
        :is-admin="isAdmin"
        v-model:open="createOpen"
        v-model:draft="createDraft"
        @submit="handleCreate"
        @reset="resetDraft"
        @cancel="resetDraft"
    />

    <edit-product
        :is-admin="isAdmin"
        v-model:open="editOpen"
        v-model:draft="editDraft"
        :saving="saving"
        @submit="handleUpdate"
        @reset="resetEdit"
        @cancel="resetEdit"
    />

    <div class="flex items-end justify-between">
      <h1 class="text-3xl font-bold">Товары</h1>
      <span class="text-sm text-gray-500" v-if="!isLoading && !error">{{ products.length }} шт.</span>
    </div>

    <div v-if="error" class="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{{ error }}</div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 6" :key="n" class="rounded-2xl border p-4">
        <Skeleton height="180px" class="w-full mb-3 rounded-xl"/>
        <Skeleton height="22px" class="w-3/4 mb-2"/>
        <Skeleton height="18px" class="w-1/2 mb-4"/>
        <Skeleton height="40px" class="w-full rounded-lg"/>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <Card
          v-for="p in products"
          :key="'product-id-' + p.id"
          class="rounded-2xl shadow-sm hover:shadow-md transition-shadow border bg-white"
      >
        <template #header>
          <img :alt="p.title" class="w-full h-48 object-cover rounded-t-2xl"
               :src="`https://picsum.photos/seed/${p.id}/600/400`" loading="lazy"/>
        </template>

        <template #title>
          <div class="flex items-start justify-between gap-3">
            <span class="text-lg font-semibold">{{ p.title }}</span>
            <Tag :value="p.stock > 0 ? 'В наличии' : 'Нет на складе'" :severity="p.stock > 0 ? 'success' : 'danger'"/>
          </div>
        </template>

        <template #content>
          <div class="text-2xl font-bold mb-4">{{ money(p.price) }}</div>
          <Button :disabled="p.stock <= 0" class="w-full"
                  :severity="p.stock > 0 ? 'success' : 'secondary'"
                  :loading="creatingOrderId === p.id"
                  @click="createOrderForProduct(p)">
            <template v-if="p.stock > 0">Добавить в заказ</template>
            <template v-else>Нет в наличии</template>
          </Button>
          <Button v-if="isAdmin" @click="openEdit(p)" severity="info" class="my-3 w-full">Редактировать</Button>
          <Button v-if="isAdmin"
                  class="w-full !text-white"
                  severity="danger"
                  :loading="deletingId === p.id"
                  :disabled="deletingId === p.id"
                  @click="handleRemove(p)">
            Удалить товар
          </Button>
        </template>
      </Card>
    </div>
  </div>
</template>
