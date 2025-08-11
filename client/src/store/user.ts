import {defineStore} from "pinia";
import {computed, ref} from "vue";
import type {IUser} from "../types/user.ts";
import {Roles} from "../const/roles.ts";

export const useUserStore = defineStore('user', () => {
    const userData = ref<IUser>({
        token: localStorage.getItem('token') ?? '',
        role: (localStorage.getItem('role') as Roles | null) ?? Roles.DEFAULT,
        user: {
            id: null,
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            role: Roles.DEFAULT
        }
    })

    const setUserData = (data: IUser) => {
        userData.value.token = data?.token;
        userData.value.role = data?.role;
        userData.value.user = data?.user;
        localStorage.setItem('token', data?.token)
        localStorage.setItem('user', JSON.stringify(data?.user))
        localStorage.setItem('role', data?.role === Roles.USER ? Roles.USER : Roles.ADMIN);
    }

    function logout() {
        userData.value = {
            token: '',
            role: Roles.DEFAULT,
            user: {id: null, username: '', firstName: '', lastName: '', email: '', role: Roles.DEFAULT}
        }
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('user')
    }

    const isAuthed = computed(() => !!userData.value.token)
    const getRole = computed(() => {
        if (userData.value.role === Roles.ADMIN) return 'Админ'
        if (userData.value.role === Roles.USER) return 'Пользователь'
        return ''
    })
    return {
        userData,
        setUserData,
        getRole,
        isAuthed,
        logout,
    }
})