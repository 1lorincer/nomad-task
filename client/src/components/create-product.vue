<script setup lang="ts">
import {defineEmits} from 'vue'
import {Button, Dialog, InputText, InputNumber} from "primevue"

type Draft = {
  title: string
  price: number | null
  stock: number | null
  description?: string
}

const emit = defineEmits<{ (e: 'submit'): void; (e: 'cancel'): void; (e: 'reset'): void }>()
const props = defineProps<{ isAdmin: boolean }>()
const open = defineModel<boolean>('open', {default: false})
const draft = defineModel<Draft>('draft', {
  default: {title: '', price: null, stock: null, description: ''}
})

const onSubmit = () => emit('submit')
const onCancel = () => {
  open.value = false;
  emit('cancel')
}
const onReset = () => emit('reset')
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <h2 class="text-xl font-semibold">Каталог</h2>

    <Button
        v-if="props.isAdmin"
        label="Добавить товар"
        severity="success"
        @click="open = true"
    />
  </div>

  <Dialog v-model:visible="open" modal header="Новый товар" class="w-full sm:w-9/12 md:w-7/12 lg:w-5/12">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Название</label>
        <InputText v-model="draft.title" placeholder="Напр.: Snickers 50g" class="w-full"/>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Цена</label>
          <InputNumber v-model="draft.price" :min="0" mode="decimal" :minFractionDigits="0" :maxFractionDigits="2"
                       class="w-full"/>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Остаток</label>
          <InputNumber v-model="draft.stock" :min="0" :step="1" showButtons class="w-full"/>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <Button label="Создать" severity="success" @click="onSubmit"/>
        <Button label="Сбросить" outlined @click="onReset"/>
        <Button label="Отмена" severity="secondary" outlined @click="onCancel"/>
      </div>
    </div>
  </Dialog>
</template>
