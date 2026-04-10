// src/pages/Biblioteca.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'
import { recursosService, subtemasService } from '../services/api'
import styles from './Biblioteca.module.css'

const TIPO_LIBRO = 1
const PROXY = 'http://127.0.0.1:8000/api'

export default function Biblioteca() {
  const { token }   = useAuth()
  const navigate    = useNavigate()

  const [libros, setLibros]     = useState([])
  const [subtemas, setSubtemas] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro]     = useState(null)

  useEffect(() => {
    if (!token) return
    Promise.all([
      recursosService.getAll(token),
      subtemasService.getAll(token),
    ])
      .then(([recursos, subs]) => {
        const todos = Array.isArray(recursos) ? recursos : recursos.items ?? []
        setLibros(todos.filter(r => r.id_tipo === TIPO_LIBRO))
        setSubtemas(Array.isArray(subs) ? subs : subs.items ?? [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const librosFiltrados = libros.filter(l =>
    l.titulo.toLowerCase().includes(busqueda.toLowerCase()) &&
    (filtro ? l.id_subtema === filtro : true)
  )

  const subtemasConLibros = subtemas.filter(s =>
    libros.some(l => l.id_subtema === s.id_subtema)
  )

  const agrupadosPorSubtema = subtemasConLibros.map(s => ({
    subtema: s,
    libros: librosFiltrados.filter(l => l.id_subtema === s.id_subtema)
  })).filter(g => g.libros.length > 0)

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.centerWrap}>
        <Loader size={32} className={styles.spinner} />
        <p>Cargando biblioteca…</p>
      </div>
    </>
  )

  if (error) return (
    <>
      <Navbar />
      <div className={styles.centerWrap}>
        <AlertCircle size={32} style={{ color: '#fc8181' }} />
        <p>No se pudo cargar la biblioteca</p>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        <div className={styles.hero}>
          <div className={styles.heroDecor} />
          <p className={styles.heroEyebrow}>Academix</p>
          <h1 className={styles.heroTitle}>Biblioteca Virtual</h1>
          <p className={styles.heroSub}>Explora nuestra colección de libros por materia</p>

          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar libro por título…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {subtemasConLibros.length > 0 && (
            <div className={styles.filtros}>
              <button
                className={`${styles.filtroBtn} ${filtro === null ? styles.filtroBtnActive : ''}`}
                onClick={() => setFiltro(null)}
              >
                Todos
              </button>
              {subtemasConLibros.map(s => (
                <button
                  key={s.id_subtema}
                  className={`${styles.filtroBtn} ${filtro === s.id_subtema ? styles.filtroBtnActive : ''}`}
                  onClick={() => setFiltro(filtro === s.id_subtema ? null : s.id_subtema)}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.content}>
          {agrupadosPorSubtema.length === 0 ? (
            <div className={styles.empty}>
              <BookOpen size={56} className={styles.emptyIcon} />
              <p>No se encontraron libros</p>
            </div>
          ) : (
            agrupadosPorSubtema.map(({ subtema, libros: librosGrupo }) => (
              <SeccionSubtema
                key={subtema.id_subtema}
                subtema={subtema}
                libros={librosGrupo}
                onLibroClick={id => navigate(`/recursos/ver/${id}`)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

function SeccionSubtema({ subtema, libros, onLibroClick }) {
  const carruselRef = useRef(null)

  const scroll = (dir) => {
    if (!carruselRef.current) return
    carruselRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <div className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTitleWrap}>
          <span className={styles.seccionLinea} />
          <h2 className={styles.seccionTitle}>{subtema.nombre}</h2>
        </div>
        <div className={styles.seccionControls}>
          <button className={styles.scrollBtn} onClick={() => scroll(-1)}>
            <ChevronLeft size={18} />
          </button>
          <button className={styles.scrollBtn} onClick={() => scroll(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className={styles.carrusel} ref={carruselRef}>
        {libros.map(libro => (
          <LibroCard
            key={libro.id_recurso}
            libro={libro}
            onClick={() => onLibroClick(libro.id_recurso)}
          />
        ))}
      </div>
    </div>
  )
}

function LibroCard({ libro, onClick }) {
  const [cover, setCover] = useState(null)

  useEffect(() => {
    if (!libro.external_id) return

    const worksUrl = `https://openlibrary.org/works/${libro.external_id}.json`
    const proxyWorksUrl = `${PROXY}/proxy/portada?url=${encodeURIComponent(worksUrl)}`

    fetch(proxyWorksUrl)
      .then(r => r.json())
      .then(data => {
        const coverId = data.covers?.[0]
        if (coverId) {
          const coverImgUrl = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          setCover(`${PROXY}/proxy/portada?url=${encodeURIComponent(coverImgUrl)}`)
        }
      })
      .catch(() => null)
  }, [libro.external_id])

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardCover}>
        {cover
          ? <img src={cover} alt={libro.titulo} className={styles.cardImg} />
          : (
            <div className={styles.cardPlaceholder}>
              <BookOpen size={36} />
            </div>
          )
        }
        <div className={styles.cardOverlay}>
          <span className={styles.cardOverlayText}>Leer ahora</span>
        </div>
      </div>
      <div className={styles.cardInfo}>
        <h3 className={styles.cardTitle}>{libro.titulo}</h3>
        {libro.descripcion && (
          <p className={styles.cardDesc}>
            {libro.descripcion.length > 80
              ? libro.descripcion.slice(0, 80) + '…'
              : libro.descripcion}
          </p>
        )}
      </div>
    </div>
  )
}
