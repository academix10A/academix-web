import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Lock, Shield, Bell,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, Loader,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { usuariosService } from '../services/api.js'
import styles from './AjustesPage.module.css'

function SuccessToast({ message }) {
  return (
    <div className={styles.toast} data-type="success">
      <CheckCircle size={16} />
      <span>{message}</span>
    </div>
  )
}

function ErrorToast({ message }) {
  return (
    <div className={styles.toast} data-type="error">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  )
}

export default function AjustesPage() {
  const { user, token, refreshUser } = useAuth()
  const navigate = useNavigate()

  // ── Perfil form ──
  const [nombre,           setNombre]           = useState(user?.nombre ?? '')
  const [apellidoPaterno,  setApellidoPaterno]  = useState(user?.apellido_paterno ?? '')
  const [apellidoMaterno,  setApellidoMaterno]  = useState(user?.apellido_materno ?? '')
  const [email,            setEmail]            = useState(user?.email ?? '')
  const [savingPerfil,     setSavingPerfil]     = useState(false)

  // ── Password form ──
  const [passActual,       setPassActual]       = useState('')
  const [passNueva,        setPassNueva]        = useState('')
  const [passConfirm,      setPassConfirm]      = useState('')
  const [showActual,       setShowActual]       = useState(false)
  const [showNueva,        setShowNueva]        = useState(false)
  const [showConfirm,      setShowConfirm]      = useState(false)
  const [savingPass,       setSavingPass]       = useState(false)

  // ── Feedback ──
  const [toast, setToast] = useState(null) // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Handlers ──
  const handleGuardarPerfil = async (e) => {
    e.preventDefault()
    setSavingPerfil(true)
    try {
      const usuario_data = await usuariosService.me()
      const id_usuario = usuario_data.id_usuario
      await usuariosService.putUser(
        id_usuario,
        { nombre, apellido_paterno: apellidoPaterno, apellido_materno: apellidoMaterno, email }
      )
      refreshUser?.()
      showToast('success', 'Perfil actualizado correctamente')
    } catch (err) {
      showToast('error', err.message ?? 'No se pudo actualizar el perfil')
    } finally {
      setSavingPerfil(false)
    }
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    if (passNueva !== passConfirm) {
      showToast('error', 'Las contraseñas no coinciden')
      return
    }
    if (passNueva.length < 8) {
      showToast('error', 'La contraseña debe tener al menos 8 caracteres')
      return
    }
    setSavingPass(true)
    try {
      const usuario_data = await usuariosService.me()
      const id_usuario = usuario_data.id_usuario
      await usuariosService.patchUserPassword(
        id_usuario,
        passActual,
        passNueva
      )
      setPassActual(''); setPassNueva(''); setPassConfirm('')
      showToast('success', 'Contraseña cambiada correctamente')
    } catch (err) {
      showToast('error', err.message ?? 'No se pudo cambiar la contraseña')
    } finally {
      setSavingPass(false)
    }
  }

  const displayName = user ? `${user.nombre ?? ''} ${user.apellido_paterno ?? ''}`.trim() : 'Usuario'
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const memberSince = user?.fecha_registro
    ? new Date(user.fecha_registro).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
    : 'Hace 1 mes'
  const rol = user?.rol ?? 'Estudiante'

  return (
    <>
      <Navbar />
      {toast && (
        toast.type === 'success'
          ? <SuccessToast message={toast.message} />
          : <ErrorToast  message={toast.message} />
      )}

      <div className={styles.page}>
        <div className={styles.inner}>

          {/* ── Top bar ── */}
          <div className={styles.topBar}>
            {/* <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button> */}
            <h1 className={styles.pageTitle}>Ajustes</h1>
          </div>

          <div className={styles.layout}>

            {/* ── Sidebar ── */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarProfile}>
                <div className={styles.sideAvatar}>{initials}</div>
                <div>
                  <p className={styles.sideName}>{displayName}</p>
                  <p className={styles.sideEmail}>{user?.email}</p>
                </div>
              </div>

              <nav className={styles.sideNav}>
                <a href="#perfil"     className={styles.sideLink}><User     size={16} /> Información del perfil</a>
                <a href="#password"   className={styles.sideLink}><Lock     size={16} /> Cambiar contraseña</a>
                <a href="#cuenta"     className={styles.sideLink}><Shield   size={16} /> Información de la cuenta</a>
              </nav>
            </aside>

            {/* ── Content ── */}
            <div className={styles.content}>

              {/* Perfil */}
              <section id="perfil" className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderIcon}><User size={18} /></div>
                  <div>
                    <h2 className={styles.cardTitle}>Información del perfil</h2>
                    <p className={styles.cardSub}>Actualiza tu nombre y correo electrónico</p>
                  </div>
                </div>

                <form onSubmit={handleGuardarPerfil} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nombre</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Apellido Paterno</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={apellidoPaterno}
                        onChange={e => setApellidoPaterno(e.target.value)}
                        placeholder="Apellido paterno"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Apellido Materno</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={apellidoMaterno}
                      onChange={e => setApellidoMaterno(e.target.value)}
                      placeholder="Apellido materno"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Correo electrónico</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.btnPrimary} disabled={savingPerfil}>
                      {savingPerfil
                        ? <><Loader size={15} className={styles.spin} /> Guardando…</>
                        : <><Save size={15} /> Guardar cambios</>
                      }
                    </button>
                  </div>
                </form>
              </section>

              {/* Password */}
              <section id="password" className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderIcon}><Lock size={18} /></div>
                  <div>
                    <h2 className={styles.cardTitle}>Cambiar contraseña</h2>
                    <p className={styles.cardSub}>Usa una contraseña de al menos 8 caracteres</p>
                  </div>
                </div>

                <form onSubmit={handleCambiarPassword} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Contraseña actual</label>
                    <div className={styles.inputWrap}>
                      <input
                        type={showActual ? 'text' : 'password'}
                        className={styles.input}
                        value={passActual}
                        onChange={e => setPassActual(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        required
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowActual(v => !v)}>
                        {showActual ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nueva contraseña</label>
                      <div className={styles.inputWrap}>
                        <input
                          type={showNueva ? 'text' : 'password'}
                          className={styles.input}
                          value={passNueva}
                          onChange={e => setPassNueva(e.target.value)}
                          placeholder="Nueva contraseña"
                          required
                        />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowNueva(v => !v)}>
                          {showNueva ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Confirmar contraseña</label>
                      <div className={styles.inputWrap}>
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          className={styles.input}
                          value={passConfirm}
                          onChange={e => setPassConfirm(e.target.value)}
                          placeholder="Confirma tu contraseña"
                          required
                        />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Strength hint */}
                  {passNueva && (
                    <div className={styles.strengthWrap}>
                      <div
                        className={styles.strengthBar}
                        data-strength={
                          passNueva.length >= 12 && /[A-Z]/.test(passNueva) && /[0-9]/.test(passNueva) ? 'strong'
                          : passNueva.length >= 8 ? 'medium'
                          : 'weak'
                        }
                      />
                      <span className={styles.strengthLabel}>
                        {passNueva.length >= 12 && /[A-Z]/.test(passNueva) && /[0-9]/.test(passNueva) ? 'Contraseña fuerte'
                          : passNueva.length >= 8 ? 'Contraseña aceptable'
                          : 'Contraseña débil'}
                      </span>
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.btnPrimary} disabled={savingPass}>
                      {savingPass
                        ? <><Loader size={15} className={styles.spin} /> Cambiando…</>
                        : <><Lock size={15} /> Cambiar contraseña</>
                      }
                    </button>
                  </div>
                </form>
              </section>

              {/* Account info */}
              <section id="cuenta" className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderIcon}><Shield size={18} /></div>
                  <div>
                    <h2 className={styles.cardTitle}>Información de la cuenta</h2>
                    <p className={styles.cardSub}>Detalles de tu cuenta en Academix</p>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Rol</span>
                    <span className={styles.infoVal}>{rol.charAt(0).toUpperCase() + rol.slice(1)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Miembro desde</span>
                    <span className={styles.infoVal}>{memberSince}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Membresía</span>
                    <span className={styles.infoVal}>{user?.membresia ?? 'Plan Free'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>ID de cuenta</span>
                    <span className={styles.infoVal} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      #{user?.id_usuario ?? '—'}
                    </span>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}