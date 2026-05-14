export type Province = {
  id: number;
  name: string;
};

export type City = {
  id: number;
  name: string;
  zip_code: string;
};

export type ShippingService = {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

export type Product = {
  id: number;
  product_name: string | null;
  disc: number | null;
  price: number | null;
  stock: number | null;
};

export type ProductSize = {
  id: number;
  product_id: number | null;
  size: number | null;
};

export type SettingRecord = {
  id: number;
  created_at?: string;
  key: string;
  value: string;
};

export type OrderItem = {
  productId: string;
  productSizeId: string;
  qty: number;
};