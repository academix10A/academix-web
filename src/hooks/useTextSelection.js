/*
// src/hooks/useTextSelection.js
import { useState, useEffect, useCallback, useRef } from 'react'

export function useTextSelection(containerRef) {
  const [selection, setSelection] = useState({ text: '', rect: null })

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    const text = sel?.toString().trim()
    if (!text || text.length < 2) { setSelection({ text: '', rect: null }); return }
    if (!containerRef.current?.contains(sel.anchorNode)) return
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    setSelection({ text, rect })
  }, [containerRef])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseUp])

  return [selection, () => setSelection({ text: '', rect: null })]
}*/

// src/hooks/useTextSelection.js
import { useState, useEffect, useCallback } from 'react'

export function useTextSelection(containerRef) {
  const [selection, setSelection] = useState({ text: '', rect: null })

  const handleMouseUp = useCallback(() => {
    // Intentar selección normal primero
    let sel = window.getSelection()
    let text = sel?.toString().trim()

    // Si no hay selección normal, buscar en el Shadow DOM
    if (!text && containerRef.current?.shadowRoot) {
      sel = containerRef.current.shadowRoot.getSelection?.()
      text = sel?.toString().trim()
    }

    // También buscar en shadow roots hijos
    if (!text && containerRef.current) {
      const shadowHost = containerRef.current.querySelector('*')
      if (shadowHost?.shadowRoot) {
        sel = shadowHost.shadowRoot.getSelection?.()
        text = sel?.toString().trim()
      }
    }

    if (!text || text.length < 2) {
      setSelection({ text: '', rect: null })
      return
    }

    try {
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setSelection({ text, rect })
    } catch {
      setSelection({ text: '', rect: null })
    }
  }, [containerRef])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseUp])

  return [selection, () => setSelection({ text: '', rect: null })]
}