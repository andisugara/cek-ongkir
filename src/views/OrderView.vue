<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import {
  calculateShipping,
  fetchCities,
  fetchProvinces,
} from "../lib/rajaongkir";
import { fetchProducts, fetchSettings, loadTable } from "../lib/supabase";
import type {
  City,
  OrderItem,
  Product,
  ProductSize,
  Province,
  SettingRecord,
  ShippingService,
} from "../lib/types";

const telegramChatId = import.meta.env.VITE_APP_TELEGRAM_CHAT_ID || "";
const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY || "";

const isLoadingProvinces = ref(false);
const isLoadingCities = ref(false);
const isCalculatingOngkir = ref(false);
const isSendingTelegram = ref(false);
const isLoadingProducts = ref(false);
const isLoadingSettings = ref(false);
const submitMessage = ref("");

const provinces = ref<Province[]>([]);
const cities = ref<City[]>([]);
const shippingServices = ref<ShippingService[]>([]);
const products = ref<Product[]>([]);
const productSizes = ref<ProductSize[]>([]);
const settings = ref<SettingRecord[]>([]);

const courierOptions = [
  "jne",
  "sicepat",
  "ide",
  "sap",
  "jnt",
  "ninja",
  "tiki",
  "lion",
  "anteraja",
  "pos",
  "ncs",
  "rex",
  "rpx",
  "sentral",
  "star",
  "wahana",
  "dse",
];

const form = reactive({
  recipientName: "",
  phone: "",
  street: "",
  rtRw: "",
  provinceId: "",
  cityId: "",
  postalCode: "",
  paymentMethod: "COD",
  selectedCourierCode: "",
  selectedServiceCode: "",
  weightGram: 1000,
  shippingDiscountPercent: 40,
  paymentFee: 0,
});

const items = ref<OrderItem[]>([
  {
    productId: "",
    productSizeId: "",
    qty: 1,
  },
]);

const selectedProvince = computed(() =>
  provinces.value.find((province) => String(province.id) === form.provinceId),
);

const selectedCity = computed(() =>
  cities.value.find((city) => String(city.id) === form.cityId),
);

const uniqueCouriers = computed(() => {
  const couriers = new Map<string, ShippingService>();
  shippingServices.value.forEach((service) => {
    if (!couriers.has(service.code)) {
      couriers.set(service.code, service);
    }
  });

  return Array.from(couriers.values());
});

const servicesByCourier = computed(() =>
  shippingServices.value.filter(
    (service) => service.code === form.selectedCourierCode,
  ),
);

const selectedService = computed(() =>
  shippingServices.value.find(
    (service) =>
      service.code === form.selectedCourierCode &&
      service.service === form.selectedServiceCode,
  ),
);

const settingsMap = computed(() => {
  return settings.value.reduce<Record<string, string>>((accumulator, row) => {
    accumulator[row.key] = row.value;
    return accumulator;
  }, {});
});

const originProvinceLabel = computed(
  () => settingsMap.value.ORIGIN_PROVINCE || "-",
);
const originCityLabel = computed(() => settingsMap.value.ORIGIN_CITY || "-");
const originCityId = computed(() => settingsMap.value.ORIGIN_CITY_ID || "");
const defaultCodPercent = computed(() => Number(settingsMap.value.COD || 0));

const subtotalNormal = computed(() =>
  items.value.reduce(
    (total, item) => total + getNormalPrice(item) * Math.max(item.qty || 1, 1),
    0,
  ),
);

const subtotalDiscounted = computed(() =>
  items.value.reduce(
    (total, item) =>
      total + getDiscountedPrice(item) * Math.max(item.qty || 1, 1),
    0,
  ),
);

const shippingCost = computed(() => selectedService.value?.cost || 0);

const shippingDiscountAmount = computed(() =>
  Math.round(
    (shippingCost.value * Number(form.shippingDiscountPercent || 0)) / 100,
  ),
);

const shippingAfterDiscount = computed(() =>
  Math.max(shippingCost.value - shippingDiscountAmount.value, 0),
);

const codFeeAmount = computed(() => {
  if (form.paymentMethod !== "COD") return 0;

  const baseAmount = subtotalDiscounted.value + shippingAfterDiscount.value;
  return Math.round((baseAmount * Number(form.paymentFee || 0)) / 100);
});

const grandTotal = computed(
  () =>
    subtotalDiscounted.value + shippingAfterDiscount.value + codFeeAmount.value,
);

const currencyFormatter = new Intl.NumberFormat("id-ID");

function formatRupiah(value: number) {
  return `Rp. ${currencyFormatter.format(Math.round(value))}`;
}

function parseNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getProductById(productId: string) {
  return products.value.find(
    (product) => product.id === parseNumber(productId),
  );
}

function getProductSizeById(sizeId: string) {
  return productSizes.value.find((size) => size.id === parseNumber(sizeId));
}

function getSizesByProductId(productId: string) {
  const id = parseNumber(productId);
  return productSizes.value.filter((size) => size.product_id === id);
}

function getNormalPrice(item: OrderItem) {
  const product = getProductById(item.productId);
  return parseNumber(product?.price);
}

function getDiscountedPrice(item: OrderItem) {
  const product = getProductById(item.productId);
  const price = parseNumber(product?.price);
  const disc = parseNumber(product?.disc);

  if (disc <= 0) return price;
  if (disc <= 100) return Math.max(price - Math.round((price * disc) / 100), 0);
  if (disc <= price) return disc;
  return Math.max(price - disc, 0);
}

function getDiscountPercent(item: OrderItem) {
  const normalPrice = getNormalPrice(item);
  const discountedPrice = getDiscountedPrice(item);

  if (normalPrice <= 0 || discountedPrice >= normalPrice) return 0;
  return Math.round(((normalPrice - discountedPrice) / normalPrice) * 100);
}

function getItemSubtotal(item: OrderItem) {
  return getDiscountedPrice(item) * Math.max(item.qty || 1, 1);
}

function getItemProductName(item: OrderItem) {
  return getProductById(item.productId)?.product_name || "-";
}

function getItemSize(item: OrderItem) {
  return getProductSizeById(item.productSizeId)?.size || "-";
}

function fillDefaultItem(item: OrderItem) {
  if (!products.value.length) return;

  if (!item.productId) {
    item.productId = String(products.value[0].id);
  }

  const availableSizes = getSizesByProductId(item.productId);
  if (!availableSizes.length) {
    item.productSizeId = "";
    return;
  }

  const hasSelectedSize = availableSizes.some(
    (size) => String(size.id) === item.productSizeId,
  );

  if (!item.productSizeId || !hasSelectedSize) {
    item.productSizeId = String(availableSizes[0].id);
  }
}

function addItem() {
  const item: OrderItem = {
    productId: "",
    productSizeId: "",
    qty: 1,
  };

  fillDefaultItem(item);
  items.value.push(item);
}

function removeItem(index: number) {
  if (items.value.length === 1) return;
  items.value.splice(index, 1);
}

function handleProductChange(item: OrderItem) {
  const availableSizes = getSizesByProductId(item.productId);
  item.productSizeId = availableSizes[0] ? String(availableSizes[0].id) : "";
}

async function fetchProductsAndSizes() {
  if (!supabaseUrl || !supabaseAnonKey) {
    submitMessage.value =
      "Konfigurasi Supabase belum lengkap untuk mengambil data produk.";
    return;
  }

  isLoadingProducts.value = true;

  try {
    const [productsResponse, sizesResponse] = await Promise.all([
      fetchProducts(),
      loadTable<ProductSize>("product_sizes", "id,product_id,size", "id.asc"),
    ]);

    products.value = productsResponse ?? [];
    productSizes.value = sizesResponse ?? [];

    items.value.forEach((item) => fillDefaultItem(item));
  } catch (error) {
    console.error(error);
    submitMessage.value = "Gagal memuat produk dari database.";
  } finally {
    isLoadingProducts.value = false;
  }
}

async function fetchAndStoreSettings() {
  isLoadingSettings.value = true;
  try {
    settings.value = (await fetchSettings()) ?? [];
    if (!form.paymentFee && defaultCodPercent.value > 0) {
      form.paymentFee = defaultCodPercent.value;
    }
  } catch (error) {
    console.error(error);
    submitMessage.value = "Gagal memuat settings dari database.";
  } finally {
    isLoadingSettings.value = false;
  }
}

async function fetchProvinceList() {
  isLoadingProvinces.value = true;
  try {
    provinces.value = await fetchProvinces();
  } catch (error) {
    console.error(error);
    submitMessage.value =
      "Gagal memuat provinsi dari RajaOngkir. Cek konfigurasi API key.";
  } finally {
    isLoadingProvinces.value = false;
  }
}

async function fetchCityList(provinceId: string) {
  if (!provinceId) {
    cities.value = [];
    return;
  }

  isLoadingCities.value = true;
  try {
    cities.value = await fetchCities(provinceId);
  } catch (error) {
    console.error(error);
    submitMessage.value = "Gagal memuat kota dari RajaOngkir.";
  } finally {
    isLoadingCities.value = false;
  }
}

async function calculateShippingCost() {
  if (!originCityId.value || !form.cityId) {
    submitMessage.value =
      "Lengkapi kota asal dari settings dan kota tujuan sebelum hitung ongkir.";
    return;
  }

  isCalculatingOngkir.value = true;
  submitMessage.value = "";

  try {
    shippingServices.value = await calculateShipping({
      originCityId: originCityId.value,
      destinationCityId: form.cityId,
      weightGram: form.weightGram,
      courierCodes: courierOptions,
    });

    if (shippingServices.value.length > 0) {
      form.selectedCourierCode = shippingServices.value[0].code;
      form.selectedServiceCode = shippingServices.value[0].service;
    } else {
      submitMessage.value = "Layanan ongkir tidak ditemukan untuk rute ini.";
    }
  } catch (error) {
    console.error(error);
    submitMessage.value =
      "Gagal menghitung ongkir. Periksa API RajaOngkir Anda.";
  } finally {
    isCalculatingOngkir.value = false;
  }
}

function buildTelegramMessage() {
  const itemLines = items.value
    .map((item, index) => {
      const productName = getItemProductName(item);
      const size = getItemSize(item);
      const qty = Math.max(item.qty || 1, 1);
      const normalPrice = getNormalPrice(item);
      const discountedPrice = getDiscountedPrice(item);

      return [
        `${index + 1}. ${productName} / Size ${size}`,
        `   Qty        : ${qty}`,
        `   Harga      : ${formatRupiah(normalPrice)}`,
        `   Diskon     : ${formatRupiah(discountedPrice)}`,
        `   Subtotal   : ${formatRupiah(discountedPrice * qty)}`,
      ].join("\n");
    })
    .join("\n\n");

  const shippingServiceLine = selectedService.value
    ? `${selectedService.value.name} - ${selectedService.value.service} (${selectedService.value.etd})`
    : "-";

  const provinceName = selectedProvince.value?.name || "-";
  const cityName = selectedCity.value?.name || "-";

  return [
    "=== PESANAN BARU ===",
    `Penerima      : ${form.recipientName || "-"}`,
    `No HP         : ${form.phone || "-"}`,
    "",
    "=== ALAMAT ===",
    `Alamat Lengkap: ${form.street || "-"}`,
    `RT / RW       : ${form.rtRw || "-"}`,
    `Kab/Kota      : ${cityName}`,
    `Provinsi      : ${provinceName}`,
    `Kode Pos      : ${form.postalCode || "-"}`,
    "",
    "=== PENGIRIMAN ===",
    `Pembayaran    : ${form.paymentMethod}`,
    `Origin        : ${originProvinceLabel.value} / ${originCityLabel.value}`,
    `Layanan Ongkir: ${shippingServiceLine}`,
    "",
    "=== ITEM PESANAN ===",
    itemLines,
    "",
    "=== RINGKASAN BIAYA ===",
    `Subtotal Normal : ${formatRupiah(subtotalNormal.value)}`,
    `Subtotal Diskon  : ${formatRupiah(subtotalDiscounted.value)}`,
    `Ongkir           : ${formatRupiah(shippingCost.value)}`,
    `Diskon Ongkir    : - ${formatRupiah(shippingDiscountAmount.value)} (${form.shippingDiscountPercent}%)`,
    `Ongkir Jadi      : ${formatRupiah(shippingAfterDiscount.value)}`,
    "",
    `Biaya COD        : ${formatRupiah(codFeeAmount.value)} (${form.paymentFee}%)`,
    `TOTAL BAYAR      : ${formatRupiah(grandTotal.value)}`,
  ].join("\n");
}

const previewMessage = computed(() => buildTelegramMessage());

async function sendToTelegram() {
  if (!telegramChatId) {
    submitMessage.value = "VITE_APP_TELEGRAM_CHAT_ID belum diisi di file .env";
    return;
  }

  if (!selectedService.value) {
    submitMessage.value =
      "Pilih kurir dan layanan ongkir dulu sebelum kirim ke Telegram.";
    return;
  }

  isSendingTelegram.value = true;
  submitMessage.value = "";

  try {
    const response = await fetch("/api/telegram/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: previewMessage.value,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result?.ok) {
      throw new Error(result?.description || "Gagal mengirim pesan Telegram");
    }

    submitMessage.value = "Pesanan berhasil dikirim ke Telegram ✅";
  } catch (error) {
    console.error(error);
    submitMessage.value = "Gagal kirim ke Telegram. Periksa bot token/chat id.";
  } finally {
    isSendingTelegram.value = false;
  }
}

watch(
  () => form.paymentMethod,
  (method) => {
    form.paymentFee = method === "COD" ? defaultCodPercent.value : 0;
  },
  { immediate: true },
);

watch(
  () => form.provinceId,
  async (newProvinceId) => {
    form.cityId = "";
    form.postalCode = "";
    cities.value = [];
    shippingServices.value = [];
    form.selectedCourierCode = "";
    form.selectedServiceCode = "";

    if (!newProvinceId) return;

    await fetchCityList(newProvinceId);
  },
);

watch(
  () => form.cityId,
  () => {
    shippingServices.value = [];
    form.selectedCourierCode = "";
    form.selectedServiceCode = "";
    form.postalCode = selectedCity.value?.zip_code || "";
  },
);

onMounted(async () => {
  await Promise.all([
    fetchProvinceList(),
    fetchProductsAndSizes(),
    fetchAndStoreSettings(),
  ]);
});
</script>

<template>
  <main class="page">
    <section class="hero card">
      <div>
        <h2>Transaksi Produk Sandal</h2>
        <p class="subtitle">
          Alamat lengkap tetap bebas diisi, sementara kota baru dimuat saat
          provinsi dipilih.
        </p>
      </div>

      <div class="origin-pill">
        <span>Origin referensi</span>
        <strong>{{ originProvinceLabel }} / {{ originCityLabel }}</strong>
      </div>
    </section>

    <section class="card">
      <div class="grid two-col">
        <label>
          Nama Penerima
          <input v-model="form.recipientName" type="text" />
        </label>
        <label>
          No HP (Aktif)
          <input v-model="form.phone" type="text" />
        </label>
      </div>

      <label>
        Alamat Lengkap
        <textarea v-model="form.street" rows="3" />
      </label>

      <div class="grid three-col">
        <label>
          RT / RW
          <input v-model="form.rtRw" type="text" />
        </label>

        <label>
          Provinsi
          <select v-model="form.provinceId" :disabled="isLoadingProvinces">
            <option value="">Pilih Provinsi</option>
            <option
              v-for="province in provinces"
              :key="province.id"
              :value="String(province.id)"
            >
              {{ province.name }}
            </option>
          </select>
        </label>

        <label>
          Kota
          <select
            v-model="form.cityId"
            :disabled="!form.provinceId || isLoadingCities"
          >
            <option value="">Pilih Kota</option>
            <option
              v-for="city in cities"
              :key="city.id"
              :value="String(city.id)"
            >
              {{ city.name }}
            </option>
          </select>
        </label>
      </div>

      <div class="grid two-col compact">
        <label>
          Kode Pos
          <input v-model="form.postalCode" type="text" />
        </label>

        <label>
          Pembayaran
          <select v-model="form.paymentMethod">
            <option value="COD">COD</option>
            <option value="Transfer">Transfer</option>
          </select>
        </label>
      </div>

      <label>
        Biaya COD (%)
        <input
          :value="form.paymentFee"
          type="number"
          min="0"
          readonly
          disabled
        />
      </label>
    </section>

    <section class="card">
      <div class="row between">
        <h3>Item Pesanan</h3>
        <button type="button" class="btn secondary" @click="addItem">
          + Tambah Item
        </button>
      </div>

      <div v-for="(item, index) in items" :key="index" class="item-box">
        <div class="row between">
          <strong>Item {{ index + 1 }}</strong>
          <button type="button" class="btn danger" @click="removeItem(index)">
            Hapus
          </button>
        </div>

        <div class="grid six-col">
          <label>
            Nama Produk
            <select
              v-model="item.productId"
              :disabled="isLoadingProducts || !products.length"
              @change="handleProductChange(item)"
            >
              <option value="">Pilih produk</option>
              <option
                v-for="product in products"
                :key="product.id"
                :value="String(product.id)"
              >
                {{ product.product_name }}
              </option>
            </select>
          </label>

          <label>
            Size
            <select v-model="item.productSizeId" :disabled="!item.productId">
              <option value="">Pilih size</option>
              <option
                v-for="size in getSizesByProductId(item.productId)"
                :key="size.id"
                :value="String(size.id)"
              >
                {{ size.size }}
              </option>
            </select>
          </label>

          <label>
            QTY
            <input v-model.number="item.qty" type="number" min="1" />
          </label>

          <label>
            Harga Normal
            <input
              :value="formatRupiah(getNormalPrice(item))"
              type="text"
              readonly
              disabled
            />
          </label>

          <label>
            <small class="discount-note" v-if="getDiscountPercent(item) > 0">
              Total (Diskon {{ getDiscountPercent(item) }}%)
            </small>
            <input
              :value="formatRupiah(getDiscountedPrice(item))"
              type="text"
              readonly
              disabled
            />
          </label>

          <label>
            Subtotal Item
            <input
              :value="formatRupiah(getItemSubtotal(item))"
              type="text"
              readonly
              disabled
            />
          </label>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="row between">
        <h3>Hitung Ongkir</h3>
        <button
          type="button"
          class="btn"
          :disabled="isCalculatingOngkir"
          @click="calculateShippingCost"
        >
          {{ isCalculatingOngkir ? "Menghitung..." : "Hitung Ongkir" }}
        </button>
      </div>

      <p class="muted">
        Origin diambil dari settings: ORIGIN_CITY_ID. Tidak ada dropdown origin,
        dan city hanya dimuat saat province tujuan dipilih.
      </p>

      <div class="grid three-col compact">
        <label>
          Berat (gram)
          <input v-model.number="form.weightGram" type="number" min="1" />
        </label>

        <label>
          Diskon Ongkir (%)
          <input
            v-model.number="form.shippingDiscountPercent"
            type="number"
            min="0"
            max="100"
          />
        </label>

        <label>
          Origin Kota (readonly)
          <input :value="originCityLabel" type="text" readonly disabled />
        </label>
      </div>

      <p class="muted" v-if="selectedCity">
        Kode pos otomatis mengikuti zip_code kota terpilih.
      </p>

      <div v-if="shippingServices.length" class="grid two-col">
        <label>
          Kurir
          <select
            v-model="form.selectedCourierCode"
            :disabled="!shippingServices.length"
          >
            <option value="">Pilih kurir</option>
            <option
              v-for="courier in uniqueCouriers"
              :key="courier.code"
              :value="courier.code"
            >
              {{ courier.name }} ({{ courier.code }})
            </option>
          </select>
        </label>

        <label>
          Layanan
          <select
            v-model="form.selectedServiceCode"
            :disabled="!servicesByCourier.length"
          >
            <option value="">Pilih layanan</option>
            <option
              v-for="service in servicesByCourier"
              :key="`${service.code}-${service.service}`"
              :value="service.service"
            >
              {{ service.service }} - {{ service.description }} (ETD
              {{ service.etd }}) - {{ formatRupiah(service.cost) }}
            </option>
          </select>
        </label>
      </div>
    </section>

    <section v-if="shippingServices.length" class="card">
      <h3>Info Hasil Ongkir</h3>
      <div v-if="selectedService" class="info-box">
        <p>
          <strong>Kurir:</strong> {{ selectedService.name }} ({{
            selectedService.code
          }})
        </p>
        <p><strong>Layanan:</strong> {{ selectedService.service }}</p>
        <p><strong>Deskripsi:</strong> {{ selectedService.description }}</p>
        <p><strong>ETD:</strong> {{ selectedService.etd }}</p>
        <p><strong>Biaya:</strong> {{ formatRupiah(selectedService.cost) }}</p>
      </div>
    </section>

    <section class="card">
      <h3>Ringkasan</h3>
      <ul class="summary">
        <li>
          <span>Subtotal Normal</span
          ><strong>{{ formatRupiah(subtotalNormal) }}</strong>
        </li>
        <li>
          <span>Subtotal Diskon</span
          ><strong>{{ formatRupiah(subtotalDiscounted) }}</strong>
        </li>
        <li>
          <span>Ongkir</span><strong>{{ formatRupiah(shippingCost) }}</strong>
        </li>
        <li>
          <span>Diskon Ongkir</span
          ><strong>- {{ formatRupiah(shippingDiscountAmount) }}</strong>
        </li>
        <li>
          <span>Ongkir Jadi</span
          ><strong>{{ formatRupiah(shippingAfterDiscount) }}</strong>
        </li>
        <li>
          <span>Biaya COD</span>
          <strong
            >{{ formatRupiah(codFeeAmount) }} ({{ form.paymentFee }}%)</strong
          >
        </li>
        <li class="total">
          <span>Total</span><strong>{{ formatRupiah(grandTotal) }}</strong>
        </li>
      </ul>
    </section>

    <section class="card">
      <h3>Preview Template Telegram</h3>
      <textarea class="preview" :value="previewMessage" rows="18" readonly />

      <div class="row between">
        <button
          type="button"
          class="btn"
          :disabled="isSendingTelegram"
          @click="sendToTelegram"
        >
          {{ isSendingTelegram ? "Mengirim..." : "Kirim ke Telegram" }}
        </button>
        <p class="status">{{ submitMessage }}</p>
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
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.subtitle,
.muted,
.status {
  color: #5b6474;
}

.origin-pill {
  border-radius: 16px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fff4d6, #ffe3c6);
  color: #7c2d12;
  min-width: 220px;
}

.origin-pill span {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.grid {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.six-col {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.compact {
  align-items: end;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #334155;
}

input,
select,
textarea,
button {
  font: inherit;
}

input,
select,
textarea {
  border: 1px solid #d7dce5;
  border-radius: 14px;
  padding: 11px 13px;
  background: #fff;
}

.row {
  display: flex;
  align-items: center;
}

.between {
  justify-content: space-between;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 11px 16px;
  background: linear-gradient(135deg, #ea580c, #c2410c);
  color: #fff;
  cursor: pointer;
}

.btn.secondary {
  background: #334155;
}

.btn.danger {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.item-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.summary {
  margin: 0;
  padding: 0;
  list-style: none;
}

.summary li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #e5e7eb;
  padding: 8px 0;
}

.summary li.total {
  border-bottom: none;
  padding-top: 12px;
  font-size: 18px;
}

.preview {
  width: 100%;
  min-height: 240px;
  white-space: pre-wrap;
}

.discount-note {
  color: #15803d;
  font-weight: 600;
}

.info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
}

@media (max-width: 1100px) {
  .six-col {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hero,
  .two-col,
  .three-col {
    grid-template-columns: 1fr;
    display: grid;
  }
}

@media (max-width: 720px) {
  .six-col,
  .two-col,
  .three-col {
    grid-template-columns: 1fr;
  }

  .hero {
    justify-content: stretch;
  }
}
</style>
