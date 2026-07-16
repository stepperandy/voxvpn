/**
 * Centralized API client for external Render backend
 * Sets the base URL and provides helper methods for API calls
 */

// Set the base URL globally
window.VOXDIGITS_API_BASE_URL = 'https://your-backend-name.onrender.com/api';

/**
 * Make an API call to the Render backend
 * @param {string} endpoint - API endpoint (e.g., '/users', '/numbers')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Response from API
 */
export async function callApi(endpoint, options = {}) {
  const url = `${window.VOXDIGITS_API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * GET request helper
 */
export function apiGet(endpoint, options = {}) {
  return callApi(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export function apiPost(endpoint, data, options = {}) {
  return callApi(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export function apiPut(endpoint, data, options = {}) {
  return callApi(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export function apiDelete(endpoint, options = {}) {
  return callApi(endpoint, { ...options, method: 'DELETE' });
}

export default {
  callApi,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};