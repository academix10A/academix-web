import { useState, useEffect } from "react";
import Navbar from '../components/Navbar.jsx';
import './Membresia.css';
import PaypalButton from "../components/PaypalButton.jsx";
import { membresiasService } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.jsx";

const ICON_TIPO = {
  mensual: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.1-2h9.8l.9-4.4-3.3 3.2L12 8.5 9.5 12.8 6.2 9.6l.9 4.4z" fill="currentColor" />
    </svg>
  ),
  semestral: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M7 2v11h3v9l7-12h-4l4-8z" fill="currentColor" />
    </svg>
  ),
};

const CheckIcon = ({ size = 15, stroke = "#E8B84B", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M4 10l4 4 8-8" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function PlanCard({ membresia, selected, onSelect, disabled }) {
  const isPopular = membresia.tipo === "mensual";
  const isGratuito = membresia.costo === 0;

  const cardClass = [
    "membership-card",
    selected ? "selected" : isPopular ? "popular" : "default",
    disabled ? "disabled" : ""
  ].join(" ");

  return (
    <div className={cardClass} onClick={() => !disabled && onSelect(membresia)}>
      {isPopular && (
        <div className="membership-card-badge">Más popular</div>
      )}

      <div className={`membership-card-icon ${selected ? "selected" : "default"}`}>
        {ICON_TIPO[membresia.tipo]}
      </div>

      {disabled && (
        <div className="membership-card-badge">
          Plan actual
        </div>
      )}

      <div className="membership-card-name">{membresia.nombre}</div>

      <div className="membership-card-price">
        {isGratuito ? (
          <span className="membership-price-amount">Gratis</span>
        ) : (
          <>
            <span className="membership-price-amount">${membresia.costo}</span>
            <span className="membership-price-period">/{membresia.tipo}</span>
          </>
        )}
      </div>

      <p className="membership-card-desc">{membresia.descripcion}</p>

      <ul className="membership-beneficios-list">
        {membresia.beneficios.map((b) => (
          <li key={b.id_beneficio} className="membership-beneficio-item">
            <CheckIcon />
            {b.nombre}
          </li>
        ))}
      </ul>

      <div className={`membership-card-indicator ${selected ? "selected" : "default"}`} />
    </div>
  );
}

function PagoForm({ membresia, onBack, onSuccess }) {
  const [loadingGratis, setLoadingGratis] = useState(false);
  const [paypalError, setPaypalError] = useState(null);

  const isGratuito = membresia.costo === 0;

  const handleActivarGratis = () => {
    setLoadingGratis(true);
    setTimeout(() => {
      setLoadingGratis(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="membership-pago-layout">

      {/* ── Resumen ── */}
      <div className="membership-resumen">
        <div className="membership-resumen-label">Resumen del pedido</div>
        <div className="membership-resumen-nombre">{membresia.nombre}</div>
        <div className="membership-resumen-desc">{membresia.descripcion}</div>

        <div className="membership-resumen-divider">
          {membresia.beneficios.map((b) => (
            <div key={b.id_beneficio} className="membership-resumen-beneficio">
              <CheckIcon size={13} strokeWidth={2.2} />
              {b.nombre}
            </div>
          ))}
        </div>

        <div className="membership-resumen-total-row">
          <div className="membership-resumen-total-inner">
            <span className="membership-resumen-total-label">Total</span>
            <span className="membership-resumen-total-amount">
              {isGratuito ? "Gratis" : `$${membresia.costo}`}
            </span>
          </div>
          {!isGratuito && (
            <div className="membership-resumen-duracion">
              Duración: {membresia.duracion_dias} días
            </div>
          )}
        </div>
      </div>

      {/* ── Panel pago ── */}
      <div className="membership-pago-panel">
        <div className="membership-pago-panel-label">
          {isGratuito ? "Confirmar suscripción" : "Método de pago"}
        </div>

        {isGratuito ? (
          <>
            <div className="membership-gratis-box">
              <p className="membership-gratis-text">
                El Plan Gratuito no requiere ningún método de pago. Haz clic en{" "}
                <strong style={{ color: "#fff" }}>Activar Plan</strong> para comenzar de inmediato.
              </p>
            </div>
            <div className="membership-gratis-actions">
              <button className="membership-btn-back" onClick={onBack}>
                ← Volver
              </button>
              <button
                className={`membership-btn-activar ${loadingGratis ? "loading" : "ready"}`}
                onClick={handleActivarGratis}
                disabled={loadingGratis}
              >
                {loadingGratis ? "Activando..." : "Activar Plan"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="membership-paypal-badge">
              <svg width="80" height="20" viewBox="0 0 80 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="16" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#009CDE">Pay</text>
                <text x="26" y="16" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#003087">Pal</text>
              </svg>
              <span className="membership-paypal-divider">Pago seguro y encriptado</span>
            </div>

            <div className="membership-paypal-box">
              <p className="membership-paypal-info">
                Al hacer clic en el botón serás redirigido a PayPal para completar tu pago de forma segura.
              </p>
              <div className="membership-paypal-btn-wrap">
                <PaypalButton idMembresia={membresia.id_membresia} />
              </div>
            </div>

            {paypalError && (
              <div className="membership-error-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#e05a5a" strokeWidth="2" />
                  <path d="M12 7v6M12 17v.5" stroke="#e05a5a" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="membership-error-text">{paypalError}</span>
              </div>
            )}

            <button className="membership-btn-back-full" onClick={onBack}>
              ← Volver a los planes
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Exito({ membresia, onReset }) {
  return (
    <div className="membership-exito">
      <div className="membership-exito-icon">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <path d="M4 12l5 5L20 6" stroke="#E8B84B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="membership-exito-title">¡Suscripción activada!</div>
      <div className="membership-exito-desc">
        Tu <strong className="membership-exito-highlight">{membresia.nombre}</strong> ha sido activado correctamente.
        {membresia.duracion_dias > 0 && <span> Duración: {membresia.duracion_dias} días.</span>}
      </div>
      <button className="membership-btn-exito" onClick={onReset}>
        Ir a mis membresías
      </button>
    </div>
  );
}

export default function PagarMembresia({ membresiaInicial = null }) {
  const [membresias, setMembresias] = useState([]);
  const [paso, setPaso] = useState(1);
  const [seleccionada, setSeleccionada] = useState(null);
  const { user } = useAuth();

  // useEffect(() => {
  //   membresiasService.getAll()
  //     .then((data) => {
  //       const membresiasFiltradas = data.filter(m => m.costo > 0);
  //       setMembresias(membresiasFiltradas);
  //       setSeleccionada(membresiasFiltradas[0]);
  //     })
  //     .catch((err) => console.error("Error cargando membresías:", err));
  // }, []);
  useEffect(() => {
    membresiasService.getAll()
      .then((data) => {
        const membresiasFiltradas = data.filter(m => m.costo > 0);
        setMembresias(membresiasFiltradas);

        const disponible = membresiasFiltradas.find(
          m => m.nombre !== user?.membresia
        );

        setSeleccionada(disponible || null);
      });
  }, [user]);

  const handleContinuar = () => {
    if (seleccionada) setPaso(2);
  };

  return (
    <>
      <Navbar />

      {/* ── Hero FUERA del container → ancho 100% ── */}
      {paso !== 3 && (
        <div className="membership-header">
          <div className="membership-label">Membresías</div>
          <h1 className="membership-title">
            {paso === 1 ? "Elige tu Plan" : "Confirmar pago"}
          </h1>
          <p className="membership-subtitle">
            {paso === 1
              ? "Accede al conocimiento al nivel que necesitas"
              : "Revisa los detalles y completa tu suscripción"}
          </p>

          <div className="membership-stepper">
            {["Seleccionar plan", "Pago"].map((label, i) => (
              <div key={i} className="membership-step-wrapper">
                <div className="membership-step-col">
                  <div className={`membership-step-circle ${paso >= i + 1 ? "active" : "inactive"}`}>
                    {i + 1}
                  </div>
                  <span className={`membership-step-label ${paso >= i + 1 ? "active" : "inactive"}`}>
                    {label}
                  </span>
                </div>
                {i < 1 && (
                  <div className={`membership-step-line ${paso >= 2 ? "active" : "inactive"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contenido centrado en su propio container ── */}
      <div className="membership-page">
        <div className="membership-container">

          {/* Paso 1 */}
          {paso === 1 && (
            <>
              <div className="membership-cards-grid">
                {membresias.map((m) => {
                  const isActive = user?.membresia === m.nombre;

                  return (
                    <PlanCard
                      key={m.id_membresia}
                      membresia={m}
                      selected={seleccionada?.id_membresia === m.id_membresia}
                      onSelect={setSeleccionada}
                      disabled={isActive}
                    />
                  );
                })}
              </div>
              <div className="membership-continue-wrap">
                <button className="membership-btn-continue" onClick={handleContinuar}>
                  Continuar →
                </button>
              </div>
            </>
          )}

          {/* Paso 2 */}
          {paso === 2 && seleccionada && (
            <PagoForm
              membresia={seleccionada}
              onBack={() => setPaso(1)}
              onSuccess={() => setPaso(3)}
            />
          )}

          {/* Paso 3 */}
          {paso === 3 && seleccionada && (
            <Exito
              membresia={seleccionada}
              onReset={() => { setPaso(1); setSeleccionada(membresias[0]); }}
            />
          )}

        </div>
      </div>
    </>
  );
}