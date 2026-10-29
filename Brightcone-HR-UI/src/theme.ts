// Light/dark theme. Only a harmless preference is stored in the browser.
const KEY = 'bc-theme'

function stored(): 'light' | 'dark' | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function currentTheme(): 'light' | 'dark' {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  const prefersDark =
    typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function initTheme() {
  const v = stored()
  if (v) {
    document.documentElement.dataset.theme = v
  } else {
    document.documentElement.dataset.theme = 'light'
  }
}

export function toggleTheme(): 'light' | 'dark' {
  const next = currentTheme() === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* private window: the choice just is not remembered */
  }
  return next
}
