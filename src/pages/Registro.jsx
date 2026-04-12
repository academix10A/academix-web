import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
    BookOpen, Mail, Lock, Eye, EyeOff,
    AlertCircle, Loader, User, UserCheck
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import styles from './Registro.module.css'
import Navbar from '../components/Navbar'

export default function Registro() {
  const { registro, login  } = useAuth()
  const navigate  = useNavigate()
  const location   = useLocation()

  const [nombre, setNombre]       = useState('')
  const [apellido_paterno, setApellidoPaterno] = useState('')
  const [apellido_materno, setApellidoMaterno] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  

const validate = () => {
  if (!nombre.trim())              return 'El nombre es obligatorio.'
  if (!apellido_paterno.trim())    return 'El apellido paterno es obligatorio.'
  if (!apellido_materno.trim())    return 'El apellido materno es obligatorio.'
  if (!email.trim())               return 'El correo es obligatorio.'
  if (!/\S+@\S+\.\S+/.test(email)) return 'Ingresa un correo válido.'
  if (!password)                   return 'La contraseña es obligatoria.'
  if (password.length < 8)         return 'Mínimo 8 caracteres.'
  if (!/[A-Z]/.test(password))     return 'Debe tener al menos una mayúscula.'
  if (!/[0-9]/.test(password))     return 'Debe tener al menos un número.'
  if (!/[!@#$%^&*]/.test(password)) return 'Debe tener al menos un carácter especial (!@#$%^&*).'
  return null
}

const handleSubmit = async (e) => {
  e.preventDefault()
  setError(null)
  const err = validate()
  if (err) { setError(err); return }
  setLoading(true)
  const result = await registro(nombre, apellido_paterno, apellido_materno, email.trim(), password)
if (result.ok) {
  const loginResult = await login(email.trim(), password)
  setLoading(false)
  if (loginResult.ok) {
    const rol = loginResult.user?.rol ?? null
    navigate(rol === 'admin' ? '/admin' : '/home')
  } else {
    navigate('/login', { state: { message: 'Cuenta creada. Inicia sesión.' } })
  }
  } else {
    setLoading(false)
    setError(result.message)
  }
}

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.bgDecor} aria-hidden="true">
          <div className={styles.bgCircle1} />
          <div className={styles.bgCircle2} />
        </div>

        <div className={styles.card}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <BookOpen size={28} strokeWidth={1.7} />
            <span>Academix</span>
          </Link>

          <h1 className={styles.title}>Bienvenido Listo para aprender y ser mejor cada dia</h1>
          <p className={styles.subtitle}>Registrate para continuar tu aprendizaje</p>

          {/* Error */}
          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          

          <form onSubmit={handleSubmit} noValidate className={styles.form}>

              {/* Nombre */}
            <div className={styles.field}>
              <label htmlFor="nombre" className={styles.label}>Nombre</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input
                  id="nombre" type="text" autoComplete="nombre"
                  className={styles.input} placeholder="Kaory"
                  value={nombre} onChange={e => setNombre(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* apellido paterno */}
            <div className={styles.field}>
              <label htmlFor="apellidopaterno" className={styles.label}>Apellido Paterno</label>
              <div className={styles.inputWrap}>
                <UserCheck size={16} className={styles.inputIcon} />
                <input
                  id="apellidopaterno" type="text" autoComplete="apellidopaterno"
                  className={styles.input} placeholder="Delgado"
                  value={apellido_paterno} onChange={e => setApellidoPaterno(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* apellido materno */}
            <div className={styles.field}>
              <label htmlFor="apellidomaterno" className={styles.label}>Apellido Materno</label>
              <div className={styles.inputWrap}>
                <UserCheck size={16} className={styles.inputIcon} />
                <input
                  id="apellidomaterno" type="text" autoComplete="apellidomaterno"
                  className={styles.input} placeholder="Porcayo"
                  value={apellido_materno} onChange={e => setApellidoMaterno(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Correo electrónico</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  id="email" type="email" autoComplete="email"
                  className={styles.input} placeholder="ejemplo@correo.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="password" type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={styles.input} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar' : 'Mostrar'}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? <><Loader size={17} className={styles.spinner} />Verificando…</>
                : 'Registrarme'}
            </button>
          </form>

          <p className={styles.footer}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className={styles.footerLink}>Inicia sesion</Link>
          </p>
        </div>
      </div>
    </>
  )
}