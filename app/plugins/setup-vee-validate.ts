import { configure } from "vee-validate"

export default defineNuxtPlugin(() => {
  configure({
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
  })
})
