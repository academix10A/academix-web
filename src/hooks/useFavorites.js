import { useState, useEffect, useCallback } from 'react'
import localforage from 'localforage'

const FAVORITES_KEY = 'academix_favorites'
const DEFAULT_STATE = { examenes: [], notas: [], recursos: [] }

export function useFavorites({ id_usuario } = {}) {
  const [favorites, setFavorites] = useState(DEFAULT_STATE)
  const [loaded, setLoaded]       = useState(false)

  const storageKey = id_usuario
    ? `${FAVORITES_KEY}_${id_usuario}`
    : FAVORITES_KEY

  // Cargar al montar o cuando cambia el usuario
  useEffect(() => {
    setLoaded(false)
    setFavorites(DEFAULT_STATE)
    localforage.getItem(storageKey).then(saved => {
      if (saved && typeof saved === 'object') {
        setFavorites({
          examenes: Array.isArray(saved.examenes) ? saved.examenes : [],
          notas:    Array.isArray(saved.notas)    ? saved.notas    : [],
          recursos: Array.isArray(saved.recursos)  ? saved.recursos  : [],
        })
      } else {
        setFavorites(DEFAULT_STATE)
      }
      setLoaded(true)
    })
  }, [storageKey])

  // Persistir ante cada cambio
  // loaded evita sobreescribir con DEFAULT_STATE vacío al montar
  useEffect(() => {
    if (!loaded) return
    localforage.setItem(storageKey, favorites)

    // [API] Ignorar por ahora:
    // if (!token) return
    // fetch('/api/favoritos', {
    //   method: 'PUT',
    //   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify(favorites),
    // }).catch(() => {})
  }, [favorites, storageKey, loaded])

  // Normalizamos a string para evitar el bug de 3 !== '3'
  const toStr          = (id)       => String(id)
  const isInList       = (list, id) => list.includes(toStr(id))
  const addToList      = (list, id) => { const s = toStr(id); return list.includes(s) ? list : [...list, s] }
  const removeFromList = (list, id) => list.filter(i => i !== toStr(id))

  // Exámenes
  const isFavoriteExamen = useCallback(
    (id) => isInList(favorites.examenes, id),
    [favorites.examenes]
  )
  const toggleFavoriteExamen = useCallback((id) => {
    setFavorites(prev => ({
      ...prev,
      examenes: isInList(prev.examenes, id)
        ? removeFromList(prev.examenes, id)
        : addToList(prev.examenes, id),
    }))
  }, [])

  //
  const isFavoriteNota = useCallback(
    (id) => isInList(favorites.notas, id),
    [favorites.notas]
  )
  const toggleFavoriteNota = useCallback((id) => {
    setFavorites(prev => ({
      ...prev,
      notas: isInList(prev.notas, id)
        ? removeFromList(prev.notas, id)
        : addToList(prev.notas, id),
    }))
  }, [])

  // Recursos
  const isFavoriteRecurso = useCallback(
    (id) => isInList(favorites.recursos, id),
    [favorites.recursos]
  )
  const toggleFavoriteRecurso = useCallback((id) => {
    setFavorites(prev => ({
      ...prev,
      recursos: isInList(prev.recursos, id)
        ? removeFromList(prev.recursos, id)
        : addToList(prev.recursos, id),
    }))
  }, [])

  const counts = {
    examenes: favorites.examenes.length,
    notas:    favorites.notas.length,
    recursos: favorites.recursos.length,
  }

  return {
    favorites,
    loaded,
    counts,
    isFavoriteExamen,    toggleFavoriteExamen,
    isFavoriteNota,      toggleFavoriteNota,
    isFavoriteRecurso,   toggleFavoriteRecurso,
  }
}