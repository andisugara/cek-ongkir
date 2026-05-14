import { createRouter, createWebHashHistory } from "vue-router";
import OrderView from "./views/OrderView.vue";
import ProductsView from "./views/ProductsView.vue";
import SettingsView from "./views/SettingsView.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "order",
      component: OrderView,
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
    },
    {
      path: "/products",
      name: "products",
      component: ProductsView,
    },
  ],
});

export default router;