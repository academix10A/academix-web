// src/pages/RecursoVerPage.jsx
import { useState } from 'react'
import Navbar from '../components/Navbar'
import NoteWidget from '../components/NoteWidget'
import RecursoViewer from '../components/recursos/RecursoViewer'

export default function RecursoVerPage() {
  // RecursoViewer le sube el recurso actual a esta página
  const [recursoActual, setRecursoActual] = useState(null)

  return (
    <>
      <Navbar />
      <RecursoViewer onRecursoLoaded={setRecursoActual} />
      <NoteWidget recursoPreseleccionado={recursoActual} />
    </>
  )
}