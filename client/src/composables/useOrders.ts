import { ref, computed } from 'vue'
import {http} from "../api/http.ts";

interface OrderItem {
    productId: number
    quantity: number
    product?: {
        id: number
        title: string
        price: number
    }
    price_at_moment?: number
}

interface Order {
    id: number
    user_id: number
    shipping_cost: number
    total_amount: number
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'shipped' | 'delivered'
    delivery_address?: string
    estimated_delivery?: string
    tracking_number?: string
    notes?: string
    created_at: string
    updated_at: string
    User?: {
        id: number
        name: string
        email: string
    }
    OrderItems?: Array<{
        id: number
        quantity: number
        price_at_moment: number
        Product: {
            id: number
            title: string
            price: number
        }
    }>
}

const orders = ref<Order[]>([])
const currentOrder = ref<Order | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useOrders() {

    const createOrder = async (orderData: {
        items: OrderItem[]
        shippingCost?: number
        deliveryAddress?: string
        notes?: string
    }) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await http.post('/orders', {
                items: orderData.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                shippingCost: orderData.shippingCost || 0,
                deliveryAddress: orderData.deliveryAddress,
                notes: orderData.notes
            })

            await getOrders()
            return response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Ошибка создания заказа'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const getOrders = async () => {
        isLoading.value = true
        error.value = null

        try {
            const response = await http.get('/orders')
            orders.value = response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Ошибка загрузки заказов'
        } finally {
            isLoading.value = false
        }
    }

    const getOrder = async (id: number) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await http.get(`/orders/${id}`)
            currentOrder.value = response.data
            return response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Ошибка загрузки заказа'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const updateOrderStatus = async (id: number, status: string) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await http.patch(`/orders/${id}/status`, { status })

            await getOrders()
            return response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Ошибка обновления статуса'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const cancelOrder = async (id: number) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await http.patch(`/orders/${id}/cancel`)

            await getOrders()
            return response.data
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Ошибка отмены заказа'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const pendingOrders = computed(() =>
        orders.value.filter(order => order.status === 'pending')
    )

    const confirmedOrders = computed(() =>
        orders.value.filter(order => order.status === 'confirmed')
    )

    const shippedOrders = computed(() =>
        orders.value.filter(order => order.status === 'shipped')
    )

    const deliveredOrders = computed(() =>
        orders.value.filter(order => order.status === 'delivered')
    )

    const cancelledOrders = computed(() =>
        orders.value.filter(order => order.status === 'cancelled')
    )

    const rejectedOrders = computed(() =>
        orders.value.filter(order => order.status === 'rejected')
    )

    const clearOrders = () => {
        orders.value = []
        currentOrder.value = null
        error.value = null
    }

    return {
        orders,
        currentOrder,
        isLoading,
        error,

        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        rejectedOrders,

        createOrder,
        getOrders,
        getOrder,
        updateOrderStatus,
        cancelOrder,
        clearOrders
    }
}