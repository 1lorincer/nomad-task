import {createRouter, createWebHistory} from "vue-router";
import Home from "../pages/home/index.vue";
import {useUserStore} from "../store/user.ts";

export const routerConifg = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/orders',
            name: 'orders',
            component: () => import("../pages/orders/index.vue"),
            meta: {requiresAuth: true}
        },
        {
            path: "/login",
            name: "login",
            component: () => import("../pages/login/index.vue")
        },
        {
            path: "/signup",
            name: "signup",
            component: () => import("../pages/signup/index.vue")
        },
    ]
})

routerConifg.beforeEach((to, _, next) => {

    if (to.meta.requiresAuth && !useUserStore().isAuthed) {
        next('/login')
    } else if (to.meta.requiresGuest && !useUserStore().isAuthed) {
        next('/')
    } else {
        next()
    }
})
