/**
  * Sanitizes an HTML string to remove any potentially harmful content.
  *
  * This function uses DOMPurify to clean the provided HTML string, ensuring that
  * it is safe to use in a web application. It leverages a virtual DOM window
  * created with Happy DOM to perform the sanitization.
  *
  * @param {string} html - The HTML string to be sanitized.
  * @returns {string} - The sanitized HTML string.
  */
export function sanitizeHTML(html: string): string {
  const nitroApp = useNitroApp()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { domPurify } = nitroApp as any
  // Use the DOMPurify instance to sanitize the HTML
  return domPurify.sanitize(html)
}
