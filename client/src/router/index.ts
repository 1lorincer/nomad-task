import {createRouter, createWebHistory} from "vue-router";

export const routerConifg = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/Home.vue')
        },
        {
            path: '/products',
            name: 'products',
            component: () => import('../views/Products.vue')
        }
    ]
})