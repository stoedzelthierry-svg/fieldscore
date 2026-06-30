// ============================================================
// FieldScore API Client — fetch wrapper avec gestion d'erreurs
// ============================================================

import type {
  Ferme,
  FermeDetail,
  FermeCreate,
  CalculResume,
  CalculDetail,
  CalculResultatV1,
  PaginatedResponse,
  ApiError,
} from "./api-types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

class ApiClientError extends Error {
  status: number;
  detail: string;
  errors?: Record<string, string[]>;

  constructor(status: number, detail: string, errors?: Record<string, string[]>) {
    super(detail);
    this.name = "ApiClientError";
    this.status = status;
    this.detail = detail;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let detail = `Erreur ${res.status}`;
      let errors: Record<string, string[]> | undefined;
      try {
        const errBody = await res.json();
        if (errBody.detail) detail = errBody.detail;
        if (errBody.errors) errors = errBody.errors;
      } catch {}
      throw new ApiClientError(res.status, detail, errors);
    }

    if (res.status === 204) return undefined as T;

    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiClientError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError(0, "La requête a expiré. Veuillez réessayer.");
    }
    throw new ApiClientError(
      0,
      "Impossible de contacter le serveur. Vérifiez votre connexion."
    );
  }
}

// --- Fermes ---

export async function getFermes(
  page = 1,
  size = 20,
  search?: string
): Promise<PaginatedResponse<Ferme>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search) params.set("search", search);
  return request(`/api/fermes?${params}`);
}

export async function getFerme(id: number): Promise<FermeDetail> {
  return request(`/api/fermes/${id}`);
}

export async function createFerme(data: FermeCreate): Promise<FermeDetail> {
  return request("/api/fermes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFerme(
  id: number,
  data: Partial<FermeCreate>
): Promise<FermeDetail> {
  return request(`/api/fermes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFerme(id: number): Promise<void> {
  return request(`/api/fermes/${id}`, { method: "DELETE" });
}

// --- Calculs ---

export async function lancerCalcul(fermeId: number): Promise<CalculDetail> {
  return request(`/api/fermes/${fermeId}/calculs`, {
    method: "POST",
  });
}

export async function getCalculV1(fermeId: number): Promise<CalculResultatV1> {
  return request(`/api/v1/fermes/${fermeId}/calcul`, {
    method: "POST",
    body: JSON.stringify({ inclure_iae: true }),
  });
}

export async function getCalculDetail(
  fermeId: number,
  calculId: number
): Promise<CalculDetail> {
  return request(`/api/fermes/${fermeId}/calculs/${calculId}`);
}

export async function getCalculsFerme(
  fermeId: number
): Promise<CalculResume[]> {
  return request(`/api/fermes/${fermeId}/calculs`);
}

// --- Export ---

export async function exportCalcul(
  fermeId: number,
  calculId: number,
  format: "json" | "csv" = "json"
): Promise<Blob> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(
      `${API_BASE}/api/fermes/${fermeId}/calculs/${calculId}/export?format=${format}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    return await res.blob();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export { ApiClientError };
