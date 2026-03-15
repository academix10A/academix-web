// src/pages/admin/Dashboard.jsx
import { useAuth } from '../../hooks/useAuth'
import { LogOut, Shield } from 'lucide-react'
import styles from './Dashboard.module.css'


export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Shield size={22} className={styles.shieldIcon} />
          <span className={styles.brand}>Academix <span>Admin</span></span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1 className={styles.title}>Panel de Administración</h1>
          <p className={styles.sub}>Hola ke hace{user?.email}. solo lo hice para probar lo de admin </p>
          <img src="/gaturroña.jpg" alt="Ingaturroña" className={styles.logoImg} />

        </div>

      </main>
    </div>
  )
}