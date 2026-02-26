import { ref, readonly } from 'vue'

export interface Toast {
  id: string
  title?: string
  description?: string
  open: boolean
}

const toasts = ref<Toast[]>([])
const TOAST_LIMIT = 1

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export function useToast() {
  function toast(options: { title?: string; description?: string }) {
    const id = genId()
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      open: true,
    }
    toasts.value = [newToast, ...toasts.value].slice(0, TOAST_LIMIT)
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 5000)
    return { id, dismiss: () => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    } }
  }

  function dismiss(id?: string) {
    if (id) {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    } else {
      toasts.value = []
    }
  }

  return {
    toasts: readonly(toasts),
    toast,
    dismiss,
  }
}
