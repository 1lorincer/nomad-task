import {ref, computed} from 'vue'
import {useToast} from 'primevue/usetoast'
import {http} from '../api/http.ts'
import {useUserStore} from '../store/user.ts'
import {Roles} from '../const/roles.ts'

export type Product = { id: number; title: string; price: number | string; stock: number }
export type Draft = { title: string; price: number | null; stock: number | null; description?: string }

export function useProducts() {
    const toast = useToast()
    const user = useUserStore()

    const isAdmin = computed(() => user.userData.role === Roles.ADMIN)

    const products = ref<Product[]>([])
    const isLoading = ref(true)
    const error = ref('')

    const createOpen = ref(false)
    const createDraft = ref<Draft>({title: '', price: null, stock: null, description: ''})

    const editOpen = ref(false)
    const editDraft = ref<Draft>({title: '', price: null, stock: null, description: ''})
    const editId = ref<number | null>(null)
    const saving = ref(false)

    const deletingId = ref<number | null>(null)

    const validateDraft = (d: Draft): string | null => {
        if (!d.title.trim()) return 'Название обязательно'
        if (d.price == null || Number.isNaN(d.price) || Number(d.price) < 0) return 'Цена указана неверно'
        if (d.stock == null || !Number.isInteger(d.stock) || Number(d.stock) < 0) return 'Остаток указан неверно'
        return null
    }

    const resetDraft = () => {
        createDraft.value = {title: '', price: null, stock: null, description: ''}
    }

    const resetEdit = () => {
        editDraft.value = {title: '', price: null, stock: null, description: ''}
        editId.value = null
    }

    async function getProducts() {
        isLoading.value = true
        error.value = ''
        try {
            const {data} = await http.get('/products')
            products.value = data
        } catch (e: any) {
            error.value = e?.response?.data?.message || 'Не удалось загрузить товары'
        } finally {
            isLoading.value = false
        }
    }

    async function handleCreate() {
        const err = validateDraft(createDraft.value)
        if (err) {
            toast.add({severity: 'error', summary: 'Проверьте форму', detail: err, life: 3000})
            return
        }
        try {
            await http.post(
                '/products',
                {
                    title: createDraft.value.title.trim(),
                    price: Number(createDraft.value.price),
                    stock: Number(createDraft.value.stock),
                },
                {headers: {Authorization: `Bearer ${user.userData.token}`}}
            )
            toast.add({severity: 'success', summary: 'Готово', detail: 'Товар создан', life: 2500})
            createOpen.value = false
            resetDraft()
            await getProducts()
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Не удалось создать товар'
            toast.add({severity: 'error', summary: 'Ошибка', detail: msg, life: 3500})
        }
    }

    function openEdit(p: Product) {
        if (!isAdmin.value) return
        editId.value = p.id
        editDraft.value = {
            title: p.title,
            price: Number(p.price),
            stock: p.stock,
            description: ''
        }
        editOpen.value = true
    }

    async function handleUpdate() {
        const err = validateDraft(editDraft.value)
        if (err) {
            toast.add({severity: 'error', summary: 'Проверьте форму', detail: err, life: 3000})
            return
        }
        try {
            saving.value = true
            await http.put(
                `/products/${editId.value}`,
                {
                    title: editDraft.value.title.trim(),
                    price: Number(editDraft.value.price),
                    stock: Number(editDraft.value.stock),
                },
                {headers: {Authorization: `Bearer ${user.userData.token}`}}
            )

            const i = products.value.findIndex(x => x.id === editId.value)
            if (i > -1) {
                products.value[i] = {
                    ...products.value[i],
                    title: editDraft.value.title.trim(),
                    price: Number(editDraft.value.price),
                    stock: Number(editDraft.value.stock),
                }
            }

            toast.add({severity: 'success', summary: 'Сохранено', detail: 'Товар обновлён', life: 2500})
            editOpen.value = false
            resetEdit()
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Не удалось обновить товар'
            toast.add({severity: 'error', summary: 'Ошибка', detail: msg, life: 3500})
        } finally {
            saving.value = false
        }
    }

    async function handleRemove(p: Product) {
        try {
            deletingId.value = p.id
            await http.delete(`/products/${p.id}`, {
                headers: {Authorization: `Bearer ${user.userData.token}`}
            })
            products.value = products.value.filter(x => x.id !== p.id)
            toast.add({severity: 'success', summary: 'Удалено', detail: `Товар «${p.title}» удалён`, life: 2500})
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Не удалось удалить товар'
            toast.add({severity: 'error', summary: 'Ошибка', detail: msg, life: 3500})
        } finally {
            deletingId.value = null
        }
    }

    function addToOrder(p: Product) {
        console.log('addToOrder', p.id)
    }

    return {
        products, isLoading, error,
        createOpen, createDraft,
        editOpen, editDraft, editId, saving,
        deletingId,
        isAdmin,

        getProducts,
        handleCreate,
        openEdit,
        handleUpdate,
        handleRemove,
        addToOrder,

        resetDraft,
        resetEdit,
    }
}
