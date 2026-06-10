export const API_URL = import.meta.env.VITE_API_URL || 'https://workforce-pro-production.up.railway.app';

export const readApiResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `La API devolvio HTML en ${response.url}. Verifica VITE_API_URL y que el backend actualizado este desplegado.`
    );
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Error de API (${response.status})`);
  }
  return data;
};
