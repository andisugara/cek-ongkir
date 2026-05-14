<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Cek Ongkir</p>
        <h1>Order, Settings, Products</h1>
      </div>

      <nav class="nav">
        <RouterLink to="/">Transaksi</RouterLink>
        <RouterLink to="/settings">Setting</RouterLink>
        <RouterLink to="/products">Produk</RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.topbar {
  max-width: 1200px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 12px;
  color: #c2410c;
}

h1 {
  margin: 0;
  font-size: 28px;
  color: #1f2937;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nav a {
  padding: 10px 14px;
  border-radius: 999px;
  text-decoration: none;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.nav a.router-link-active {
  background: #1f2937;
  color: #fff;
}

@media (max-width: 720px) {
  .app-shell {
    padding: 16px;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
