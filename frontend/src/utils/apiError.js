/**
 * Extracts a human-readable error message from an Axios error.
 * @param {any} err - The caught error object
 * @param {string} fallback - Message shown when no specific message found
 * @returns {string}
 */
export function getApiError(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.message || fallback;
}