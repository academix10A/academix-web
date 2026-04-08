// src/services/urlDetector.js
// Detecta el tipo de URL y devuelve cómo renderizarla

export const URL_TYPE = {
  DRIVE:       'drive',
  YOUTUBE:     'youtube',
  OPENLIBRARY: 'openlibrary',
  GUTENBERG:   'gutenberg',
  ARCHIVE:     'archive',
  AUDIO:       'audio',
  VIDEO:       'video',
  PDF:         'pdf',
  HTML:        'html',
  UNKNOWN:     'unknown',
}

export function detectUrlType(url) {
  if (!url) return URL_TYPE.UNKNOWN
  const u = url.toLowerCase()

  if (u.includes('drive.google.com'))                      return URL_TYPE.DRIVE
  if (u.includes('youtube.com') || u.includes('youtu.be')) return URL_TYPE.YOUTUBE
  if (u.includes('openlibrary.org'))                       return URL_TYPE.OPENLIBRARY
  if (u.includes('gutenberg.org'))                         return URL_TYPE.GUTENBERG
  if (u.includes('archive.org'))                           return URL_TYPE.ARCHIVE
  if (u.includes('vimeo.com'))                             return URL_TYPE.VIDEO
  if (u.endsWith('.mp3') || u.endsWith('.wav') || u.endsWith('.ogg') ||
      u.endsWith('.aac') || u.endsWith('.m4a'))            return URL_TYPE.AUDIO
  if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov')) return URL_TYPE.VIDEO
  if (u.endsWith('.pdf'))                                  return URL_TYPE.PDF
  if (u.endsWith('.html') || u.endsWith('.htm'))           return URL_TYPE.HTML

  return URL_TYPE.UNKNOWN
}

/**
 * Normaliza una URL que puede ser:
 *   - Absoluta:  https://ejemplo.com/archivo.pdf  → se devuelve igual
 *   - Relativa:  /documentos/archivo.pdf          → se convierte a absoluta
 *                academix/documentos/archivo.pdf  → se convierte a absoluta
 *
 * Usar siempre esta función antes de pasar la URL a un iframe o fetch.
 */
export function resolveUrl(url) {
  if (!url) return null

  // Ya es absoluta
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // Relativa con /
  if (url.startsWith('/')) return `${window.location.origin}${url}`

  // Relativa sin / (ej: "academix/documentos/x.pdf")
  return `${window.location.origin}/${url}`
}

/**
 * Convierte URL de Drive para embed
 * https://drive.google.com/file/d/ID/view  →  https://drive.google.com/file/d/ID/preview
 */
export function getDriveEmbedUrl(url) {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`
  }
  return url
}

/**
 * Convierte URL de YouTube para embed
 * https://youtube.com/watch?v=ID  →  https://www.youtube.com/embed/ID
 * https://youtu.be/ID             →  https://www.youtube.com/embed/ID
 */
export function getYoutubeEmbedUrl(url) {
  let videoId = null

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) videoId = watchMatch[1]

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) videoId = shortMatch[1]

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
  }
  return url
}

/**
 * Extrae el Work ID de Open Library
 * https://openlibrary.org/works/OL123W  →  OL123W
 */
export function getOpenLibraryId(url) {
  const match = url.match(/\/works\/(OL\w+)/)
  return match ? match[1] : null
}