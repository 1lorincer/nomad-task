<!-- pages/Orders.vue -->
<script setup lang="ts">
import {onMounted, ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {DataTable, Column, Button, Tag, Card, Toolbar, Dropdown, Dialog, useToast} from 'primevue'
import {useOrders} from '../../composables/useOrders.ts'
import {money} from "../../utils/money.ts";
import {useUserStore} from "../../store/user.ts";
import {Roles} from "../../const/roles.ts";

const router = useRouter()
const toast = useToast()
const {orders, isLoading, error, getOrders, updateOrderStatus, cancelOrder} = useOrders()

const selectedOrder = ref(null)
const showOrderDialog = ref(false)
const statusFilter = ref('all')
const newStatus = ref('')
const showStatusDialog = ref(false)
const orderToUpdate = ref(null)

const statusOptions = [
  {label: 'Все заказы', value: 'all'},
  {label: 'Ожидает', value: 'pending'},
  {label: 'Подтвержден', value: 'confirmed'},
  {label: 'Отклонен', value: 'rejected'},
  {label: 'Отменен', value: 'cancelled'},
  {label: 'Отправлен', value: 'shipped'},
  {label: 'Доставлен', value: 'delivered'}
]

const adminStatusOptions = [
  {label: 'Ожидает', value: 'pending'},
  {label: 'Подтвержден', value: 'confirmed'},
  {label: 'Отклонен', value: 'rejected'},
  {label: 'Отправлен', value: 'shipped'},
  {label: 'Доставлен', value: 'delivered'}
]

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === statusFilter.value)
})

const isAdmin = computed(() => useUserStore().userData.role === Roles.ADMIN)

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'info'
    case 'shipped':
      return 'success'
    case 'delivered':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'cancelled':
      return 'secondary'
    default:
      return 'info'
  }
}

const getStatusLabel = (status: string) => {
  const statusMap = {
    pending: 'Ожидает',
    confirmed: 'Подтвержден',
    rejected: 'Отклонен',
    cancelled: 'Отменен',
    shipped: 'Отправлен',
    delivered: 'Доставлен'
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

const viewOrderDetails = (order: any) => {
  selectedOrder.value = order
  showOrderDialog.value = true
}

const handleCancelOrder = async (orderId: number) => {
  try {
    await cancelOrder(orderId)
    toast.add({
      severity: 'success',
      summary: 'Заказ отменен',
      detail: 'Заказ успешно отменен'
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.message
    })
  }
}

const openStatusDialog = (order: any) => {
  orderToUpdate.value = order
  newStatus.value = order.status
  showStatusDialog.value = true
}

const handleUpdateStatus = async () => {
  if (!orderToUpdate.value || !newStatus.value) return

  try {
    await updateOrderStatus(orderToUpdate.value.id, newStatus.value)
    toast.add({
      severity: 'success',
      summary: 'Статус обновлен',
      detail: 'Статус заказа успешно изменен'
    })
    showStatusDialog.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.message
    })
  }
}

const canCancelOrder = (order: any) => {
  return ['pending', 'confirmed'].includes(order.status) &&
      (isAdmin.value || order.user_id === useUserStore().userData?.user?.id)
}

onMounted(() => {
  getOrders()
})
</script>

<template>
  <div class="orders-page">
    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">
            {{ isAdmin ? 'Все заказы' : 'Мои заказы' }}
          </h1>
          <Button
              @click="router.push('/')"
              label="К товарам"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
          />
        </div>
      </template>

      <template #content>
        <Toolbar class="mb-4">
          <template #start>
            <div class="flex items-center gap-4">
              <label for="status-filter" class="font-medium">Фильтр по статусу:</label>
              <Dropdown
                  id="status-filter"
                  v-model="statusFilter"
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                  class="w-48"
              />
            </div>
          </template>

          <template #end>
            <Button
                @click="getOrders"
                icon="pi pi-refresh"
                :loading="isLoading"
                severity="secondary"
                outlined
            />
          </template>
        </Toolbar>

        <DataTable
            :value="filteredOrders"
            :loading="isLoading"
            paginator
            :rows="10"
            responsive-layout="scroll"
            :empty-message="error || 'Заказы не найдены'"
        >
          <Column field="id" header="№" sortable class="w-20">
            <template #body="{ data }">
              #{{ data.id }}
            </template>
          </Column>

          <Column field="total_amount" header="Сумма" sortable>
            <template #body="{ data }">
              {{ money(data.total_amount) }}
            </template>
          </Column>

          <Column field="status" header="Статус" sortable>
            <template #body="{ data }">
              <Tag
                  :value="getStatusLabel(data.status)"
                  :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <Column field="created_at" header="Дата создания" sortable>
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>

          <Column field="estimated_delivery" header="Ожидаемая доставка">
            <template #body="{ data }">
              {{ data.estimated_delivery ? formatDate(data.estimated_delivery) : '-' }}
            </template>
          </Column>

          <Column header="Действия" class="w-48">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                    @click="viewOrderDetails(data)"
                    icon="pi pi-eye"
                    size="small"
                    severity="info"
                    outlined
                    v-tooltip="'Детали заказа'"
                />

                <Button
                    v-if="isAdmin"
                    @click="openStatusDialog(data)"
                    icon="pi pi-pencil"
                    size="small"
                    severity="warning"
                    outlined
                    v-tooltip="'Изменить статус'"
                />

                <Button
                    v-if="canCancelOrder(data)"
                    @click="handleCancelOrder(data.id)"
                    icon="pi pi-times"
                    size="small"
                    severity="danger"
                    outlined
                    v-tooltip="'Отменить заказ'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Диалог деталей заказа -->
    <Dialog
        v-model:visible="showOrderDialog"
        header="Детали заказа"
        :style="{ width: '80vw', maxWidth: '800px' }"
        modal
    >
      <div v-if="selectedOrder" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-bold text-lg mb-2">Информация о заказе</h3>
            <div class="space-y-2">
              <p><strong>Номер заказа:</strong> #{{ selectedOrder.id }}</p>
              <p><strong>Статус:</strong>
                <Tag
                    :value="getStatusLabel(selectedOrder.status)"
                    :severity="getStatusSeverity(selectedOrder.status)"
                />
              </p>
              <p><strong>Дата создания:</strong> {{ formatDate(selectedOrder.created_at) }}</p>
              <p v-if="selectedOrder.estimated_delivery">
                <strong>Ожидаемая доставка:</strong> {{ formatDate(selectedOrder.estimated_delivery) }}
              </p>
              <p v-if="selectedOrder.tracking_number">
                <strong>Номер отслеживания:</strong> {{ selectedOrder.tracking_number }}
              </p>
            </div>
          </div>

          <div v-if="isAdmin && selectedOrder.User">
            <h3 class="font-bold text-lg mb-2">Информация о клиенте</h3>
            <div class="space-y-2">
              <p><strong>Имя:</strong> {{ selectedOrder.User.name }}</p>
              <p><strong>Email:</strong> {{ selectedOrder.User.email }}</p>
            </div>
          </div>

          <div v-if="selectedOrder.delivery_address" class="md:col-span-2">
            <h3 class="font-bold text-lg mb-2">Адрес доставки</h3>
            <p>{{ selectedOrder.delivery_address }}</p>
          </div>
        </div>

        <div>
          <h3 class="font-bold text-lg mb-2">Товары в заказе</h3>
          <DataTable :value="selectedOrder.OrderItems" class="mb-4">
            <Column field="Product.title" header="Товар"/>
            <Column field="quantity" header="Количество"/>
            <Column field="price_at_moment" header="Цена за единицу">
              <template #body="{ data }">
                {{ money(data.price_at_moment) }}
              </template>
            </Column>
            <Column header="Сумма">
              <template #body="{ data }">
                {{ money(data.price_at_moment * data.quantity) }}
              </template>
            </Column>
          </DataTable>
        </div>

        <div class="border-t pt-4">
          <div class="flex justify-between items-center">
            <div class="space-y-1">
              <p><strong>Стоимость товаров:</strong> {{
                  money(selectedOrder.total_amount - selectedOrder.shipping_cost)
                }}</p>
              <p><strong>Доставка:</strong> {{ money(selectedOrder.shipping_cost) }}</p>
              <p class="text-xl font-bold"><strong>Итого:</strong> {{ money(selectedOrder.total_amount) }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.notes" class="border-t pt-4">
          <h3 class="font-bold text-lg mb-2">Примечания</h3>
          <p>{{ selectedOrder.notes }}</p>
        </div>
      </div>
    </Dialog>

    <!-- Диалог изменения статуса (только для админа) -->
    <Dialog
        v-model:visible="showStatusDialog"
        header="Изменить статус заказа"
        :style="{ width: '400px' }"
        modal
    >
      <div v-if="orderToUpdate" class="space-y-4">
        <p>Заказ #{{ orderToUpdate.id }}</p>
        <div>
          <label for="new-status" class="block font-medium mb-2">Новый статус:</label>
          <Dropdown
              id="new-status"
              v-model="newStatus"
              :options="adminStatusOptions"
              option-label="label"
              option-value="value"
              class="w-full"
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button
              @click="showStatusDialog = false"
              label="Отмена"
              severity="secondary"
              outlined
          />
          <Button
              @click="handleUpdateStatus"
              label="Обновить"
              severity="success"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.orders-page {
  padding: 1rem;
}

@media (max-width: 768px) {
  .orders-page {
    padding: 0.5rem;
  }
}
</style>