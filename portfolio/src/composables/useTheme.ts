import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

export function useTheme() {
  const toggle = useToggle(isDark)

  function setTheme(theme: 'light' | 'dark' | 'system') {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    } else {
      isDark.value = theme === 'dark'
    }
  }

  return {
    isDark,
    toggle,
    setTheme,
  }
}
