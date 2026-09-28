import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import './Quiz.css'

const EASE = [0.16, 1, 0.3, 1]

// Optional: URL that receives each lead as JSON (webhook, Netlify Function, Make, n8n…).
// Set VITE_LEADS_ENDPOINT in a .env file to enable it.
const LEADS_ENDPOINT = import.meta.env.VITE_LEADS_ENDPOINT

const STEPS = [
  {
    id: 'industry',
    title: '¿Qué tipo de negocio tienes?',
    hint: 'Nos ayuda a proponerte automatizaciones probadas en tu sector.',
    type: 'single',
    options: [
      { value: 'ecommerce', label: 'E-commerce / Retail' },
      { value: 'restaurant', label: 'Restaurante / Cafetería' },
      { value: 'health', label: 'Salud / Clínica' },
      { value: 'realestate', label: 'Inmobiliaria' },
      { value: 'professional', label: 'Servicios profesionales', sub: 'Legal, contable, consultoría' },
      { value: 'education', label: 'Educación / Cursos' },
      { value: 'marketing', label: 'Agencia / Marketing' },
      { value: 'logistics', label: 'Distribuidora / Logística' },
      { value: 'other', label: 'Otro' }
    ]
  },
  {
    id: 'size',
    title: '¿Cuántas personas trabajan en tu empresa?',
    type: 'single',
    options: [
      { value: 'solo', label: 'Solo yo', score: 4 },
      { value: '2-10', label: '2 – 10', score: 10 },
      { value: '11-50', label: '11 – 50', score: 18 },
      { value: '51-200', label: '51 – 200', score: 22 },
      { value: '200+', label: 'Más de 200', score: 25 }
    ]
  },
  {
    id: 'needs',
    title: '¿Qué te gustaría automatizar?',
    hint: 'Elige todas las que apliquen.',
    type: 'multi',
    options: [
      { value: 'support', label: 'Atención al cliente', sub: 'Chatbot en WhatsApp o web' },
      { value: 'sales', label: 'Ventas y seguimiento de leads' },
      { value: 'booking', label: 'Agendamiento de citas' },
      { value: 'billing', label: 'Facturación y cobranza' },
      { value: 'inventory', label: 'Inventario y pedidos' },
      { value: 'reports', label: 'Reportes y análisis de datos' },
      { value: 'content', label: 'Marketing y contenido' },
      { value: 'ops', label: 'Procesos internos', sub: 'Aprobaciones, documentos, RR. HH.' }
    ]
  },
  {
    id: 'tools',
    title: '¿Qué herramientas usas hoy?',
    hint: 'Elige todas las que apliquen.',
    type: 'multi',
    options: [
      { value: 'whatsapp', label: 'WhatsApp Business' },
      { value: 'sheets', label: 'Excel / Google Sheets' },
      { value: 'crm', label: 'CRM', sub: 'HubSpot, Salesforce, Pipedrive…' },
      { value: 'erp', label: 'ERP / Sistema contable' },
      { value: 'store', label: 'Shopify / WooCommerce' },
      { value: 'manual', label: 'Ninguna, todo es manual' }
    ]
  },
  {
    id: 'hours',
    title: '¿Cuántas horas por semana dedica tu equipo a tareas repetitivas?',
    type: 'single',
    options: [
      { value: '<5', label: 'Menos de 5 h', score: 5 },
      { value: '5-15', label: '5 – 15 h', score: 12 },
      { value: '15-40', label: '15 – 40 h', score: 20 },
      { value: '40+', label: 'Más de 40 h', score: 25 }
    ]
  },
  {
    id: 'budget',
    title: '¿Qué inversión mensual contemplas?',
    type: 'single',
    options: [
      { value: '<300', label: 'Menos de $300 USD', score: 5 },
      { value: '300-1000', label: '$300 – $1,000 USD', score: 18 },
      { value: '1000-3000', label: '$1,000 – $3,000 USD', score: 28 },
      { value: '3000+', label: 'Más de $3,000 USD', score: 35 },
      { value: 'unknown', label: 'Aún no lo sé', score: 10 }
    ]
  },
  {
    id: 'timeline',
    title: '¿Cuándo te gustaría empezar?',
    type: 'single',
    options: [
      { value: 'now', label: 'Lo antes posible', score: 25 },
      { value: '1-3m', label: 'En 1 – 3 meses', score: 18 },
      { value: '3-6m', label: 'En 3 – 6 meses', score: 8 },
      { value: 'exploring', label: 'Solo estoy explorando', score: 0 }
    ]
  },
  {
    id: 'role',
    title: '¿Cuál es tu rol en la decisión?',
    type: 'single',
    options: [
      { value: 'owner', label: 'Soy el dueño / decido yo', score: 15 },
      { value: 'influencer', label: 'Participo en la decisión', score: 8 },
      { value: 'research', label: 'Investigo para alguien más', score: 3 }
    ]
  },
  { id: 'contact', title: 'Último paso: ¿a dónde te enviamos tu diagnóstico?', type: 'contact' }
]

const MAX_SCORE = 25 + 25 + 35 + 25 + 15

const SERVICES = {
  support: 'Agente de IA para atención 24/7 en WhatsApp y web',
  sales: 'Automatización de ventas: captura, calificación y seguimiento de leads',
  booking: 'Agenda inteligente con recordatorios automáticos',
  billing: 'Flujos de facturación y cobranza sin intervención manual',
  inventory: 'Sincronización de inventario y pedidos entre tus sistemas',
  reports: 'Dashboards automáticos y reportes generados con IA',
  content: 'Generación y programación de contenido con IA',
  ops: 'Automatización de procesos internos y documentos'
}

const TIERS = [
  { min: 70, key: 'hot', label: 'Alta prioridad', text: 'Tu negocio tiene un potencial de automatización alto. Un especialista te contactará en menos de 24 horas.' },
  { min: 40, key: 'warm', label: 'Buen encaje', text: 'Vemos oportunidades claras. Te enviaremos una propuesta inicial y agendaremos una llamada.' },
  { min: 0, key: 'cold', label: 'Explorando', text: 'Te compartiremos recursos y casos de uso de tu sector para que evalúes el siguiente paso.' }
]

const EMPTY_CONTACT = { name: '', company: '', email: '', phone: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function computeResult(answers) {
  const raw = STEPS.reduce((sum, step) => {
    if (step.type !== 'single') return sum
    const opt = step.options.find(o => o.value === answers[step.id])
    return sum + (opt?.score ?? 0)
  }, 0)
  const score = Math.round((raw / MAX_SCORE) * 100)
  const tier = TIERS.find(t => score >= t.min)
  const services = (answers.needs ?? []).map(n => SERVICES[n]).filter(Boolean)
  return { score, tier, services: services.length ? services : [SERVICES.ops] }
}

export default function Quiz({ open, onClose }) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState({})
  const [contact, setContact] = useState(EMPTY_CONTACT)
  const [touched, setTouched] = useState(false)
  const [result, setResult] = useState(null)
  const [sending, setSending] = useState(false)

  const current = STEPS[step]
  const progress = result ? 100 : (step / STEPS.length) * 100

  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const reset = () => {
    setStep(0)
    setDir(1)
    setAnswers({})
    setContact(EMPTY_CONTACT)
    setTouched(false)
    setResult(null)
  }

  const contactErrors = useMemo(() => {
    const errors = {}
    if (!contact.name.trim()) errors.name = 'Escribe tu nombre'
    if (!EMAIL_RE.test(contact.email.trim())) errors.email = 'Escribe un correo válido'
    return errors
  }, [contact])

  const canContinue =
    current.type === 'single'
      ? Boolean(answers[current.id])
      : current.type === 'multi'
        ? (answers[current.id]?.length ?? 0) > 0
        : true

  const go = delta => {
    setDir(delta)
    setStep(s => s + delta)
  }

  const selectSingle = value => {
    setAnswers(a => ({ ...a, [current.id]: value }))
    // Small pause so the selection is visible before advancing.
    setTimeout(() => go(1), 220)
  }

  const toggleMulti = value => {
    setAnswers(a => {
      const list = a[current.id] ?? []
      return { ...a, [current.id]: list.includes(value) ? list.filter(v => v !== value) : [...list, value] }
    })
  }

  const submit = async e => {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(contactErrors).length) return

    const outcome = computeResult(answers)
    const lead = {
      ...contact,
      answers,
      score: outcome.score,
      tier: outcome.tier.key,
      createdAt: new Date().toISOString()
    }

    setSending(true)
    try {
      const stored = JSON.parse(localStorage.getItem('neus-leads') || '[]')
      localStorage.setItem('neus-leads', JSON.stringify([...stored, lead]))
    } catch {
      // Storage unavailable (private mode); the endpoint below is the source of truth.
    }
    if (LEADS_ENDPOINT) {
      try {
        await fetch(LEADS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        })
      } catch (err) {
        console.error('No se pudo enviar el lead', err)
      }
    }
    setSending(false)
    setDir(1)
    setResult(outcome)
  }

  const variants = {
    enter: d => ({ opacity: 0, y: d > 0 ? 24 : -24 }),
    center: { opacity: 1, y: 0 },
    exit: d => ({ opacity: 0, y: d > 0 ? -24 : 24 })
  }

  return (
    <AnimatePresence onExitComplete={reset}>
      {open && (
        <motion.div
          className="quiz-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Diagnóstico de automatización"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <motion.div
            className="quiz-shell"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <header className="quiz-top">
              <p className="quiz-eyebrow">
                <span className="dot" />
                Diagnóstico de automatización con IA
              </p>
              <button className="quiz-close" type="button" onClick={onClose} aria-label="Cerrar">
                <X size={14} strokeWidth={2.5} />
              </button>
            </header>

            <div className="quiz-progress" aria-hidden="true">
              <motion.span animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: EASE }} />
            </div>
            {!result && (
              <p className="quiz-counter">
                {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
              </p>
            )}

            <div className="quiz-stage">
              <AnimatePresence mode="wait" custom={dir}>
                {result ? (
                  <motion.div
                    key="result"
                    className="quiz-step"
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <div className="result-head">
                      <div className="result-score">
                        <span className="result-number">{result.score}</span>
                        <span className="result-of">/100</span>
                      </div>
                      <span className={`result-tier tier-${result.tier.key}`}>{result.tier.label}</span>
                    </div>
                    <h2 className="quiz-title">
                      Gracias, {contact.name.trim().split(' ')[0]}.
                      <br />
                      Este es tu punto de partida.
                    </h2>
                    <p className="quiz-hint">{result.tier.text}</p>

                    <p className="result-label">Lo que automatizaríamos primero</p>
                    <ul className="result-list">
                      {result.services.map(s => (
                        <li key={s}>
                          <span className="result-check"><Check size={12} strokeWidth={3} /></span>
                          {s}
                        </li>
                      ))}
                    </ul>

                    <div className="quiz-actions">
                      <button className="btn btn-primary" type="button" onClick={onClose}>
                        Volver a Neus
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={current.id}
                    className="quiz-step"
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <h2 className="quiz-title">{current.title}</h2>
                    {current.hint && <p className="quiz-hint">{current.hint}</p>}

                    {current.type === 'contact' ? (
                      <form className="quiz-form" id="quiz-contact" onSubmit={submit} noValidate>
                        {[
                          { key: 'name', label: 'Nombre', type: 'text', auto: 'name', required: true },
                          { key: 'company', label: 'Empresa', type: 'text', auto: 'organization' },
                          { key: 'email', label: 'Correo', type: 'email', auto: 'email', required: true },
                          { key: 'phone', label: 'WhatsApp', type: 'tel', auto: 'tel' }
                        ].map(f => (
                          <label key={f.key} className="quiz-field">
                            <span>
                              {f.label}
                              {!f.required && <em> · opcional</em>}
                            </span>
                            <input
                              type={f.type}
                              autoComplete={f.auto}
                              value={contact[f.key]}
                              onChange={e => setContact(c => ({ ...c, [f.key]: e.target.value }))}
                              aria-invalid={touched && Boolean(contactErrors[f.key])}
                            />
                            {touched && contactErrors[f.key] && <small>{contactErrors[f.key]}</small>}
                          </label>
                        ))}
                      </form>
                    ) : (
                      <div className={`quiz-options${current.options.length > 5 ? ' is-grid' : ''}`}>
                        {current.options.map(opt => {
                          const selected =
                            current.type === 'multi'
                              ? (answers[current.id] ?? []).includes(opt.value)
                              : answers[current.id] === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              className={`quiz-option${selected ? ' is-selected' : ''}`}
                              aria-pressed={selected}
                              onClick={() =>
                                current.type === 'multi' ? toggleMulti(opt.value) : selectSingle(opt.value)
                              }
                            >
                              <span className="quiz-option-text">
                                {opt.label}
                                {opt.sub && <small>{opt.sub}</small>}
                              </span>
                              <span className="quiz-option-mark">
                                {selected && <Check size={11} strokeWidth={3} />}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!result && (
              <footer className="quiz-nav">
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => go(-1)}
                  disabled={step === 0}
                >
                  <ArrowLeft size={14} /> Atrás
                </button>
                {current.type === 'contact' ? (
                  <button type="submit" form="quiz-contact" className="btn btn-primary btn-icon" disabled={sending}>
                    {sending ? 'Enviando…' : 'Ver mi diagnóstico'} <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-icon"
                    onClick={() => go(1)}
                    disabled={!canContinue}
                  >
                    Continuar <ArrowRight size={14} />
                  </button>
                )}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
