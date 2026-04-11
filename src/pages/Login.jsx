import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  BookOpen, Mail, Lock, Eye, EyeOff,
  AlertCircle, Loader, Copy, Check, KeyRound
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import styles from './Login.module.css'
import Navbar from '../components/Navbar'

export default function Login() {
  const { login, token } = useAuth()
  const navigate  = useNavigate()
  const location   = useLocation()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied]       = useState(false)

  const validate = () => {
    if (!email.trim())               return 'El correo es obligatorio.'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Ingresa un correo válido.'
    if (!password)                   return 'La contraseña es obligatoria.'
    if (password.length < 6)         return 'La contraseña debe tener al menos 6 caracteres.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)
    if (result.ok) {
      // Redirigir según el rol del token
      // user ya está disponible porque login() actualizó el contexto
      const rol = result.user?.rol ?? null
      if (rol === 'admin') {
        navigate('/admin')        // admin → su dashboard
      } else {
        // gratis o premium → home (usePermissions controla qué ven ahí)
        const from = location.state?.from?.pathname ?? '/dashboard'
        navigate(from, { replace: true })
      }
    } else {
      setError(result.message)
    }
  }

  const handleCopy = () => {
    if (!token) return
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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

          <h1 className={styles.title}>Bienvenido de nuevo</h1>
          <p className={styles.subtitle}>Inicia sesión para continuar tu aprendizaje</p>

          {/* Error */}
          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
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
                : 'Iniciar Sesión'}
            </button>
          </form>

          <p className={styles.footer}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className={styles.footerLink}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </>
  )
}