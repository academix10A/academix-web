// src/pages/RecursoVerPage.jsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import NoteWidget from '../components/NoteWidget'
import RecursoViewer from '../components/recursos/RecursoViewer'
import VideoViewer from '../components/recursos/VideoViewer'
import { useAuth } from '../hooks/useAuth'
import { recursosService } from '../services/api'
import { detectUrlType, URL_TYPE } from '../services/urlDetector'
import { useEffect } from 'react'

export default function RecursoVerPage() {
  const { idRecurso }     = useParams()
  const { token }         = useAuth()
  const [recurso, setRecurso]           = useState(null)
  const [recursoActual, setRecursoActual] = useState(null)
  const [urlType, setUrlType]           = useState(null)

  useEffect(() => {
    if (!token) return
    recursosService.getById(idRecurso, token).then(data => {
      setRecurso(data)
      setUrlType(detectUrlType(data.url_archivo))
    })
  }, [idRecurso, token])

  const isVideo = urlType === URL_TYPE.YOUTUBE || urlType === URL_TYPE.VIDEO

  return (
    <>
      <Navbar />
      {isVideo
        ? <VideoViewer />
        : <RecursoViewer onRecursoLoaded={setRecursoActual} />
      }
      {!isVideo && <NoteWidget recursoPreseleccionado={recursoActual} />}
    </>
  )
}