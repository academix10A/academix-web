// src/pages/RecursosCategorias.jsx
import Navbar from '../components/Navbar'
import CategoriasList from '../components/recursos/CategoriasList'

export default function RecursosCategorias() {
  return (
    <>
        <div style={{ background: 'var(--blue-dark)', minHeight: '100vh' }}>

      <Navbar />
      <CategoriasList />

        </div>
    </>
  )
}