import {createRouter, createWebHistory} from "vue-router";
import Home from "../pages/home/index.vue";

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
            component: () => import("../pages/orders/index.vue")
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