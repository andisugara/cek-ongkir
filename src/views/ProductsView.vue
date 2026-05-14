<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  createProduct,
  createProductSize,
  deleteRow,
  fetchProductSizes,
  fetchProducts,
  updateProduct,
  updateProductSize,
} from "../lib/supabase";
import type { Product, ProductSize } from "../lib/types";

const products = ref<Product[]>([]);
const productSizes = ref<ProductSize[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const statusMessage = ref("");

const newProduct = reactive({
  product_name: "",
  disc: 0,
  price: 0,
  stock: 0,
});

const newSize = reactive({
  product_id: "",
  size: "",
});

const productOptions = computed(() => {
  return products.value.map((product) => ({
    id: product.id,
    label: product.product_name || `Product #${product.id}`,
  }));
});

async function loadProducts() {
  isLoading.value = true;
  statusMessage.value = "";

  try {
    const [productRows, sizeRows] = await Promise.all([
      fetchProducts(),
      fetchProductSizes(),
    ]);

    products.value = productRows ?? [];
    productSizes.value = sizeRows ?? [];
  } catch (error) {
    console.error(error);
    statusMessage.value = "Gagal memuat data produk.";
  } finally {
    isLoading.value = false;
  }
}

function toNumberOrNull(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function saveProduct(product: Product) {
  isSaving.value = true;
  statusMessage.value = "";

  try {
    const updated = await updateProduct(product.id, {
      product_name: product.product_name,
      disc: toNumberOrNull(product.disc),
      price: toNumberOrNull(product.price),
      stock: toNumberOrNull(product.stock),
    });

    if (updated?.[0]) {
      products.value = products.value.map((row) =>
        row.id === updated[0].id ? updated[0] : row,
      );
    }

    statusMessage.value = `Produk ${product.product_name || product.id} tersimpan.`;
  } catch (error) {
    console.error(error);
    statusMessage.value = `Gagal menyimpan produk ${product.id}.`;
  } finally {
    isSaving.value = false;
  }
}

async function addProduct() {
  if (!newProduct.product_name.trim()) {
    statusMessage.value = "Nama produk wajib diisi.";
    return;
  }

  isSaving.value = true;
  statusMessage.value = "";

  try {
    const created = await createProduct({
      product_name: newProduct.product_name.trim(),
      disc: toNumberOrNull(newProduct.disc),
      price: toNumberOrNull(newProduct.price),
      stock: toNumberOrNull(newProduct.stock),
    });

    if (created?.[0]) {
      products.value = [...products.value, created[0]];
      newProduct.product_name = "";
      newProduct.disc = 0;
      newProduct.price = 0;
      newProduct.stock = 0;
      statusMessage.value = "Produk baru berhasil ditambahkan.";
    }
  } catch (error) {
    console.error(error);
    statusMessage.value = "Gagal menambahkan produk.";
  } finally {
    isSaving.value = false;
  }
}

async function removeProduct(product: Product) {
  if (!confirm(`Hapus produk ${product.product_name || product.id}?`)) return;

  isSaving.value = true;
  statusMessage.value = "";

  try {
    await deleteRow("products", product.id);
    products.value = products.value.filter((row) => row.id !== product.id);
    productSizes.value = productSizes.value.filter(
      (size) => size.product_id !== product.id,
    );
    statusMessage.value = "Produk dihapus.";
  } catch (error) {
    console.error(error);
    statusMessage.value = "Gagal menghapus produk.";
  } finally {
    isSaving.value = false;
  }
}

async function saveSize(size: ProductSize) {
  isSaving.value = true;
  statusMessage.value = "";

  try {
    const updated = await updateProductSize(size.id, {
      product_id: toNumberOrNull(size.product_id),
      size: toNumberOrNull(size.size),
    });

    if (updated?.[0]) {
      productSizes.value = productSizes.value.map((row) =>
        row.id === updated[0].id ? updated[0] : row,
      );
    }

    statusMessage.value = `Size ${size.id} tersimpan.`;
  } catch (error) {
    console.error(error);
    statusMessage.value = `Gagal menyimpan size ${size.id}.`;
  } finally {
    isSaving.value = false;
  }
}

async function addSize() {
  if (!newSize.product_id || !newSize.size) {
    statusMessage.value = "Product dan size wajib diisi.";
    return;
  }

  isSaving.value = true;
  statusMessage.value = "";

  try {
    const created = await createProductSize({
      product_id: toNumberOrNull(newSize.product_id),
      size: toNumberOrNull(newSize.size),
    });

    if (created?.[0]) {
      productSizes.value = [...productSizes.value, created[0]];
      newSize.product_id = "";
      newSize.size = "";
      statusMessage.value = "Product size baru berhasil ditambahkan.";
    }
  } catch (error) {
    console.error(error);
    statusMessage.value = "Gagal menambahkan product size.";
  } finally {
    isSaving.value = false;
  }
}

async function removeSize(size: ProductSize) {
  if (!confirm(`Hapus size ${size.size}?`)) return;

  isSaving.value = true;
  statusMessage.value = "";

  try {
    await deleteRow("product_sizes", size.id);
    productSizes.value = productSizes.value.filter((row) => row.id !== size.id);
    statusMessage.value = "Product size dihapus.";
  } catch (error) {
    console.error(error);
    statusMessage.value = "Gagal menghapus product size.";
  } finally {
    isSaving.value = false;
  }
}

onMounted(loadProducts);
</script>

<template>
  <main class="page">
    <section class="card">
      <div class="header">
        <div>
          <p class="eyebrow">Catalog</p>
          <h2>Product CRUD</h2>
          <p class="hint">
            Bagian atas untuk tambah data, bagian bawah untuk edit cepat dalam
            bentuk kartu.
          </p>
        </div>
        <button
          type="button"
          class="btn secondary"
          :disabled="isLoading"
          @click="loadProducts"
        >
          {{ isLoading ? "Memuat..." : "Reload" }}
        </button>
      </div>

      <div class="grid four-col">
        <label>
          Nama produk baru
          <input v-model="newProduct.product_name" type="text" />
        </label>
        <label>
          Diskon
          <input v-model.number="newProduct.disc" type="number" min="0" />
        </label>
        <label>
          Harga
          <input v-model.number="newProduct.price" type="number" min="0" />
        </label>
        <label>
          Stock
          <input v-model.number="newProduct.stock" type="number" min="0" />
        </label>
      </div>

      <div class="actions">
        <button
          type="button"
          class="btn"
          :disabled="isSaving"
          @click="addProduct"
        >
          Tambah Produk
        </button>
        <p class="status">{{ statusMessage }}</p>
      </div>

      <div class="table-head products-head">
        <span>Nama Produk</span>
        <span>Diskon</span>
        <span>Harga</span>
        <span>Stock</span>
        <span>Aksi</span>
      </div>

      <div class="list">
        <div v-for="product in products" :key="product.id" class="list-row">
          <input v-model="product.product_name" type="text" />
          <input v-model.number="product.disc" type="number" min="0" />
          <input v-model.number="product.price" type="number" min="0" />
          <input v-model.number="product.stock" type="number" min="0" />
          <div class="row-actions">
            <button
              type="button"
              class="btn secondary"
              :disabled="isSaving"
              @click="saveProduct(product)"
            >
              Simpan
            </button>
            <button
              type="button"
              class="btn danger"
              :disabled="isSaving"
              @click="removeProduct(product)"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="header">
        <div>
          <p class="eyebrow">Sizes</p>
          <h2>Product Sizes CRUD</h2>
          <p class="hint">
            Tambahkan size baru dari atas, lalu edit size existing di daftar
            bawah.
          </p>
        </div>
      </div>

      <div class="grid three-col">
        <label>
          Product
          <select v-model="newSize.product_id">
            <option value="">Pilih product</option>
            <option
              v-for="option in productOptions"
              :key="option.id"
              :value="String(option.id)"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          Size baru
          <input v-model="newSize.size" type="number" min="0" />
        </label>

        <div class="add-box">
          <button
            type="button"
            class="btn"
            :disabled="isSaving"
            @click="addSize"
          >
            Tambah Size
          </button>
        </div>
      </div>

      <div class="table-head size-head">
        <span>Product</span>
        <span>Size</span>
        <span>Aksi</span>
      </div>

      <div class="list">
        <div
          v-for="size in productSizes"
          :key="size.id"
          class="list-row size-row"
        >
          <select v-model="size.product_id">
            <option
              v-for="option in productOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}
            </option>
          </select>
          <input v-model.number="size.size" type="number" min="0" />
          <div class="row-actions">
            <button
              type="button"
              class="btn secondary"
              :disabled="isSaving"
              @click="saveSize(size)"
            >
              Simpan
            </button>
            <button
              type="button"
              class="btn danger"
              :disabled="isSaving"
              @click="removeSize(size)"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 20px;
  padding: 18px;
}

.header,
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c2410c;
}

h2 {
  margin: 0;
}

.hint {
  margin: 6px 0 0;
  color: #64748b;
}

.grid {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.four-col {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.three-col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

input,
select,
button {
  font: inherit;
}

input,
select {
  border: 1px solid #d7dce5;
  border-radius: 14px;
  padding: 11px 13px;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 11px 16px;
  background: linear-gradient(135deg, #ea580c, #c2410c);
  color: white;
  cursor: pointer;
}

.btn.secondary {
  background: #334155;
}

.btn.danger {
  background: #dc2626;
}

.list {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.table-head {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  font-weight: 700;
  color: #475569;
}

.products-head {
  grid-template-columns: 1.3fr 0.7fr 0.7fr 0.7fr 220px;
}

.size-head {
  grid-template-columns: 1.3fr 0.7fr 220px;
}

.list-row {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr 0.7fr 0.7fr 220px;
  gap: 10px;
  align-items: center;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.size-row {
  grid-template-columns: 1.3fr 0.7fr 220px;
}

.row-actions {
  display: flex;
  gap: 8px;
}

.status {
  margin: 0;
  color: #475569;
}

.add-box {
  display: flex;
  align-items: end;
}

@media (max-width: 980px) {
  .header,
  .actions,
  .table-head,
  .list-row,
  .size-row,
  .four-col,
  .three-col {
    grid-template-columns: 1fr;
    display: grid;
  }

  .row-actions {
    flex-direction: column;
  }
}
</style>
