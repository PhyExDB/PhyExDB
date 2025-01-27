import { Window } from "happy-dom"
import createDOMPurify from "dompurify"

export default defineNitroPlugin((nitroApp) => {
  // Create a virtual DOM window using Happy DOM
  const happyDomWindow = new Window()

  // Cast Happy DOM's `Window` to the required `WindowLike` type
  const domPurify = createDOMPurify(happyDomWindow)

  Object.assign(nitroApp, { domPurify })
})
