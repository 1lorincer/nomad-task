<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'

type Draft = { title: string; price: number | null; stock: number | null; description?: string }

const props = defineProps<{ isAdmin: boolean; saving?: boolean }>()
const emit = defineEmits<{ (e: 'submit'): void; (e: 'cancel'): void; (e: 'reset'): void }>()

// управляется родителем:
const open  = defineModel<boolean>('open',  { default: false })
const draft = defineModel<Draft>('draft',   { default: { title:'', price:null, stock:null, description:'' } })

const onSubmit = () => emit('submit')
const onCancel = () => { open.value = false; emit('cancel') }
const onReset  = () => emit('reset')
</script>

<template>
  <Dialog v-model:visible="open" modal header="Редактировать товар" class="w-full sm:w-9/12 md:w-7/12 lg:w-5/12">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Название</label>
        <InputText v-model="draft.title" class="w-full" placeholder="Название товара" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Цена</label>
          <InputNumber v-model="draft.price" :min="0" mode="decimal" :minFractionDigits="0" :maxFractionDigits="2" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Остаток</label>
          <InputNumber v-model="draft.stock" :min="0" :step="1" showButtons class="w-full" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Описание (необязательно)</label>
        <Textarea v-model="draft.description" autoResize rows="3" class="w-full" />
      </div>

      <div class="flex gap-2 pt-2">
        <Button label="Сохранить" icon="pi pi-check" severity="info" :loading="!!saving" :disabled="!isAdmin || !!saving" @click="onSubmit" />
        <Button label="Сбросить" icon="pi pi-refresh" outlined :disabled="!!saving" @click="onReset" />
        <Button label="Отмена" icon="pi pi-times" severity="secondary" outlined :disabled="!!saving" @click="onCancel" />
      </div>
    </div>
  </Dialog>
</template>
