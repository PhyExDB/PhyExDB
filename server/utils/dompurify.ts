import { Window } from "happy-dom"
import createDOMPurify from "dompurify"

/**
 * Creates a DOMPurify instance using a virtual DOM window provided by Happy DOM.
 *
 * @returns {DOMPurify} A DOMPurify instance configured to use the virtual DOM window.
 */
export function createDomPurify() {
  // Create a virtual DOM window using Happy DOM
  const happyDomWindow = new Window()

  // Cast Happy DOM's `Window` to the required `WindowLike` type
  return createDOMPurify(happyDomWindow)
}

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
