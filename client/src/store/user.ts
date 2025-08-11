import {defineStore} from "pinia";
import {ref, computed} from "vue";
import type {IToken} from "../types/token.ts";
import {Roles} from "../const/roles.ts";

export const useUserStore = defineStore('user', () => {
    const userData = ref<IToken>({
        token: localStorage.getItem('token') ?? '',
        role: (localStorage.getItem('role') as Roles | null) ?? Roles.DEFAULT
    })

    const setUserData = (data: IToken) => {
        userData.value.token = data?.token;
        userData.value.role = data?.role;
        localStorage.setItem('token', data?.token)
        localStorage.setItem('role', data?.role === Roles.USER ? Roles.USER : Roles.ADMIN);
    }

    function logout() {
        userData.value = {token: '', role: Roles.DEFAULT}
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }

    const isAuthed = computed(() => !!userData.value.token)
    const getRole = computed(() => {
        if (userData.value.role === Roles.ADMIN) return 'Админ'
        if (userData.value.role === Roles.USER)  return 'Пользователь'
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