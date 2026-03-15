import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Menu, X, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

const links = [
  { label: 'Exámenes',       href: '/examenes',     isRoute: true },
  { label: 'Publicaciones',  href: '#publicaciones', isRoute: false },
  { label: 'Membresías',     href: '#membresias',    isRoute: false },
  { label: 'Sobre Nosotros', href: '#nosotros',      isRoute: false },
  { label: 'Contacto',       href: '#contacto',      isRoute: false },
]

export default function Navbar() {
  const [open, setOpen]         = useState(false)   
  const [dropdown, setDropdown] = useState(false)   // dropdown del usuario
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Nombre visible: si tiene nombre usa ese, si no usa la parte del email antes del @
  const displayName = user?.nombre || user?.email?.split('@')[0] || 'Usuario'

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img src="/LogoAcademix.jpeg" alt="Academix" className={styles.logoImg} />
          <span>Academix</span>
        </Link>

        <ul className={styles.links}>
          {links.map(l => (
            <li key={l.label}>
              {l.isRoute
            ? <Link to={l.href} className={styles.link}>{l.label}</Link>
            : <a href={l.href} className={styles.link}>{l.label}</a>
              }
            </li>
          ))}
        </ul>

        {/* Usuario autenticado → dropdown | sin sesión → botón login */}
        {isAuthenticated ? (
          <div className={styles.userArea} ref={dropdownRef}>
            {/* Botón que abre el dropdown */}
            <button
              className={styles.userBtn}
              onClick={() => setDropdown(v => !v)}
              aria-expanded={dropdown}
              aria-haspopup="true"
            >
              <div className={styles.avatar}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className={styles.userName}>{displayName}</span>
              <ChevronDown
                size={14}
                className={`${styles.chevron} ${dropdown ? styles.chevronOpen : ''}`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdown && (
              <div className={styles.dropdown}>
                {/* Info del usuario arriba del menú */}
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownName}>{displayName}</p>
                  <p className={styles.dropdownEmail}>{user?.email}</p>
                  {user?.membresia && (
                    <span className={styles.dropdownBadge}>{user.membresia}</span>
                  )}
                </div>

                <div className={styles.dropdownDivider} />

                {/* Opciones */}
                <Link
                  to="/perfil"
                  className={styles.dropdownItem}
                  onClick={() => setDropdown(false)}
                >
                  <User size={15} />
                  <span>Perfil</span>
                </Link>

                <Link
                  to="/recursos"
                  className={styles.dropdownItem}
                  onClick={() => setDropdown(false)}
                >
                  <BookOpen size={15} />
                  <span>Recursos</span>
                </Link>

                <Link
                  to="/ajustes"
                  className={styles.dropdownItem}
                  onClick={() => setDropdown(false)}
                >
                  <Settings size={15} />
                  <span>Ajustes</span>
                </Link>

                <div className={styles.dropdownDivider} />

                <button
                  className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                  onClick={() => { logout(); setDropdown(false) }}
                >
                  <LogOut size={15} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={styles.loginBtn}>Iniciar Sesión</Link>
        )}

        {/* Hamburguesa mobile */}
        <button
          className={styles.burger}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Drawer mobile */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        {links.map(l => (
          l.isRoute
            ? <Link key={l.label} to={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            : <a key={l.label} href={l.href} className={styles.drawerLink} onClick={() => setOpen(false)}>
                {l.label}
              </a>
        ))}
        <div className={styles.drawerDivider} />
        {isAuthenticated ? (
          <>
            <Link to="/perfil"  className={styles.drawerLink} onClick={() => setOpen(false)}>
              <User size={14} /> Perfil
            </Link>
            <Link to="/ajustes" className={styles.drawerLink} onClick={() => setOpen(false)}>
              <Settings size={14} /> Ajustes
            </Link>
            <button
              className={`${styles.drawerLink} ${styles.drawerLogout}`}
              onClick={() => { logout(); setOpen(false) }}
            >
              <LogOut size={14} /> Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.drawerLogin} onClick={() => setOpen(false)}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  )
}