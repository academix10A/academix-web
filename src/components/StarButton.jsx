import styles from './StarButton.module.css'

export default function StarButton({ active = false, onToggle, size = 16, className = '' }) {
  const handleClick = (e) => {
    // Evitamos que el click se propague a la card que tiene su propio onClick
    e.stopPropagation()
    onToggle?.()
  }

  return (
    <button
      className={`${styles.star} ${active ? styles.active : ''} ${className}`}
      onClick={handleClick}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={active}
      type="button"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.icon}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  )
}