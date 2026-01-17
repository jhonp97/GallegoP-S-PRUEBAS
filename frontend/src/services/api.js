const API_URL = import.meta.env.VITE_API_URL;

/**
 * Función genérica para realizar peticiones a la API.
 * Soporta:
 *  - apiFetch('/ruta')
 *  - apiFetch('/ruta', 'POST', body)
 *  - apiFetch('/ruta', { method, body, headers })
 */
const apiFetch = async (endpoint, methodOrOptions = 'GET', body = null) => {
  let options = {
    credentials: 'include',
    headers: {}
  };

  //  NUEVO: detectar si se pasó un objeto de opciones
  if (typeof methodOrOptions === 'object') {
    options = {
      credentials: 'include',
      ...methodOrOptions,
      headers: methodOrOptions.headers || {}
    };
  } else {
    // Forma antigua: apiFetch(url, 'POST', body)
    options.method = methodOrOptions;
    if (body) {
      if (body instanceof FormData) {
        options.body = body;
      } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
    }
  }

  //  Asegurar Content-Type solo si NO es FormData
  if (options.body && !(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición a la API');
    }

    return data;

  } catch (error) {
    console.error(`Error en la llamada a la API (${endpoint}):`, error);
    throw error;
  }
};

export default apiFetch;
