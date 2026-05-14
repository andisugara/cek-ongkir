import type { Product, ProductSize, SettingRecord } from "./types";

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY || "";

function ensureSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Konfigurasi Supabase belum lengkap.");
  }
}

function baseUrl() {
  return supabaseUrl.endsWith("/") ? supabaseUrl : `${supabaseUrl}/`;
}

function headers() {
  ensureSupabaseConfig();
  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  };
}

async function request<T>(path: string, init: RequestInit = {}) {
  ensureSupabaseConfig();

  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      ...headers(),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function loadTable<T>(
  table: string,
  select = "*",
  orderBy = "id.asc",
) {
  const query = [`select=${select}`];
  if (orderBy) {
    query.push(`order=${orderBy}`);
  }

  return request<T[]>(`${table}?${query.join("&")}`);
}

export async function createRow<T>(
  table: string,
  payload: Record<string, unknown>,
) {
  return request<T[]>(`${table}`, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateRow<T>(
  table: string,
  id: number,
  payload: Record<string, unknown>,
) {
  return request<T[]>(`${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteRow(table: string, id: number) {
  return request<void>(`${table}?id=eq.${id}`, {
    method: "DELETE",
  });
}

export async function fetchSettings() {
  return loadTable<SettingRecord>("settings", "id,created_at,key,value", "id.asc");
}

export async function createSetting(payload: { key: string; value: string }) {
  return createRow<SettingRecord>("settings", payload);
}

export async function updateSetting(
  id: number,
  payload: { key: string; value: string },
) {
  return updateRow<SettingRecord>("settings", id, payload);
}

export async function fetchProducts() {
  return loadTable<Product>(
    "products",
    "id,created_at,product_name,disc,price,stock",
    "id.asc",
  );
}

export async function createProduct(payload: {
  product_name: string;
  disc: number | null;
  price: number | null;
  stock: number | null;
}) {
  return createRow<Product>("products", payload);
}

export async function updateProduct(id: number, payload: Partial<Product>) {
  return updateRow<Product>("products", id, payload);
}

export async function fetchProductSizes() {
  return loadTable<ProductSize>(
    "product_sizes",
    "id,created_at,product_id,size",
    "id.asc",
  );
}

export async function createProductSize(payload: {
  product_id: number | null;
  size: number | null;
}) {
  return createRow<ProductSize>("product_sizes", payload);
}

export async function updateProductSize(
  id: number,
  payload: Partial<ProductSize>,
) {
  return updateRow<ProductSize>("product_sizes", id, payload);
}
