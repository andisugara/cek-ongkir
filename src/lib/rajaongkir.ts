import type { City, Province, ShippingService } from "./types";

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`/api/rajaongkir${path}`, init);

  if (!response.ok) {
    throw new Error(`RajaOngkir request failed: ${response.status}`);
  }

  const data = (await response.json()) as { data?: T };
  return data?.data ?? ([] as T);
}

export async function fetchProvinces() {
  return apiRequest<Province[]>('/destination/province');
}

export async function fetchCities(provinceId: string) {
  if (!provinceId) return [];
  return apiRequest<City[]>(`/destination/city/${provinceId}`);
}

export async function calculateShipping(params: {
  originCityId: string;
  destinationCityId: string;
  weightGram: number;
  courierCodes: string[];
}) {
  const body = new URLSearchParams({
    origin: params.originCityId,
    destination: params.destinationCityId,
    weight: String(params.weightGram),
    courier: params.courierCodes.join(":"),
    price: "lowest",
  });

  const response = await fetch(
    "/api/rajaongkir/calculate/district/domestic-cost",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    },
  );

  if (!response.ok) {
    throw new Error("Gagal menghitung ongkir");
  }

  const data = (await response.json()) as {
    data?: Array<{
      name: string;
      code: string;
      service: string;
      description: string;
      cost: number;
      etd: string;
    }>;
  };

  return (data?.data ?? []).map(
    (cost): ShippingService => ({
      name: cost.name,
      code: cost.code,
      service: cost.service,
      description: cost.description,
      cost: cost.cost ?? 0,
      etd: cost.etd ?? "-",
    }),
  );
}