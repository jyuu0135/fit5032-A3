export function escapeHTML(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function safeURL(url = '') {
  const raw = (url ?? '').trim()
  if (!raw) return ''
  try {
    const u = new URL(raw, window.location.origin)
    if (!/^https?:$/.test(u.protocol)) return ''
    return u.href
  } catch {
    return ''
  }
}
