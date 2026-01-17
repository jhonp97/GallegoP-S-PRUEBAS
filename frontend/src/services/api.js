

// const API_URL = import.meta.env.VITE_API_URL;

// /**
//  * Función genérica para realizar peticiones a la API.
//  * maneja automáticamente las credenciales (cookies) y los headers.
//  * @param {string} endpoint - La ruta de la API a la que llamar (ej. '/auth/login').
//  * @param {string} method - El método HTTP ('GET', 'POST', 'DELETE', etc.).
//  * @param {object} [body=null] - El cuerpo de la petición para POST/PATCH.
//  * @returns {Promise<object>} - La respuesta de la API en formato JSON.
//  */
// const apiFetch = async (endpoint, method = 'GET', body = null) => {
//   const options = {
//     method,
//     // ¡Esta línea es CRUCIAL! Le dice a fetch que envíe las cookies
//     // que el backend nos ha dado. Sin esto, el login no funcionará.
//     credentials: 'include',
//     headers: {},
//   };

//   if (body) {
//     // Si el body es FormData (para subir archivos), no establecemos Content-Type.
//     // El navegador lo hará automáticamente con el boundary correcto.
//     if (body instanceof FormData) {
//       options.body = body;
//     } else {
//       options.headers['Content-Type'] = 'application/json';
//       options.body = JSON.stringify(body);
//     }
//   }

//   try {
//     const response = await fetch(`${API_URL}${endpoint}`, options);

//     // Si la respuesta es 204 (No Content), no hay JSON que parsear.
//     if (response.status === 204) {
//       return { success: true };
//     }

//     const data = await response.json();

//     if (!response.ok) {
//       // Si la API devuelve un error (ej. 401, 400), lo lanzamos
//       // para poder capturarlo en el componente con un .catch()
//       throw new Error(data.message || 'Error en la petición a la API');
//     }

//     return data;

//   } catch (error) {
//     console.error(`Error en la llamada a la API (${endpoint}):`, error);
//     // Re-lanzamos el error para que el componente que llama a la función
//     // sepa que algo ha fallado y pueda reaccionar (ej. mostrar un mensaje).
//     throw error;
//   }
// };

// export default apiFetch;

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

  // 🧠 NUEVO: detectar si se pasó un objeto de opciones
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

  // 🧠 Asegurar Content-Type solo si NO es FormData
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
