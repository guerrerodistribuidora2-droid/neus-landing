import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Bot, MessagesSquare, Workflow, Plug } from 'lucide-react'
import PillNav from './PillNav.jsx'
import Quiz from './Quiz.jsx'
import './App.css'

const EASE = [0.16, 1, 0.3, 1]
const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4'

const SERVICES = [
  {
    icon: Bot,
    title: 'Agentes de IA',
    text: 'Asistentes que entienden a tus clientes, responden, califican y ejecutan tareas por ti las 24 horas.'
  },
  {
    icon: Workflow,
    title: 'Automatización de procesos',
    text: 'Eliminamos el trabajo manual repetitivo: facturas, reportes, pedidos, aprobaciones y seguimiento.'
  },
  {
    icon: MessagesSquare,
    title: 'Chatbots WhatsApp y web',
    text: 'Atención, ventas y agendamiento automáticos en los canales donde ya están tus clientes.'
  },
  {
    icon: Plug,
    title: 'Integraciones y datos',
    text: 'Conectamos tu CRM, ERP, hojas de cálculo y tienda para que la información fluya sola.'
  }
]

const PROCESS = [
  { n: '01', title: 'Diagnóstico', text: 'Analizamos tu operación y detectamos qué procesos tienen mayor retorno al automatizarse.' },
  { n: '02', title: 'Diseño', text: 'Definimos flujos, agentes e integraciones a la medida de tu negocio.' },
  { n: '03', title: 'Implementación', text: 'Construimos, probamos y lanzamos en semanas, no en meses.' },
  { n: '04', title: 'Optimización', text: 'Medimos resultados y mejoramos continuamente cada automatización.' }
]

const reveal = {
  initial: { y: 24, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: EASE }
}

function GridIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      <circle cx="3" cy="3" r="1.5" fill="currentColor" />
      <circle cx="9" cy="3" r="1.5" fill="currentColor" />
      <circle cx="3" cy="9" r="1.5" fill="currentColor" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  )
}

function Navbar({ activeHref, onOpenQuiz }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Proceso', href: '#proceso' },
    { label: 'Diagnóstico', href: '#diagnostico', onClick: onOpenQuiz }
  ]

  return (
    <motion.header
      className={`navbar${scrolled ? ' is-scrolled' : ''}`}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <PillNav
        logo={`${import.meta.env.BASE_URL}neus-logo.svg`}
        logoAlt="Neus"
        items={items}
        activeHref={activeHref}
        ease="power2.easeOut"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />

      <div className="nav-right">
        <button className="systems-pill" type="button" onClick={onOpenQuiz}>
          <span className="systems-btn">
            <GridIcon />
          </span>
          <span className="systems-label desktop-only">Diagnóstico gratuito</span>
        </button>
      </div>
    </motion.header>
  )
}

function Hero() {
  const videoRef = useRef(null)

  // React doesn't render `muted` as an HTML attribute, and iOS Safari only
  // autoplays inline videos that carry it, so set it by hand and kick off playback.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.play().catch(() => {
      // Autoplay blocked (e.g. Low Power Mode): the poster stays visible.
    })
  }, [])

  return (
    <section className="hero" id="inicio">
      <div className="video-layer">
        <motion.div
          className="video-frame"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: EASE }}
        >
          <video
            ref={videoRef}
            src={VIDEO_URL}
            poster={`${import.meta.env.BASE_URL}hero-poster.jpg`}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
          />
        </motion.div>
      </div>

      <div className="spacer" />

      <motion.div
        className="hero-footer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
      >
        <div className="footer-left">
          <motion.h1
            className="headline"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          >
            One System, Zero
            <br />
            Limits. Worldwide.
          </motion.h1>

          <motion.div
            className="cta-row"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
          >
            <a className="btn btn-primary" href="#servicios">Explore Neus</a>
            <a className="btn btn-ghost" href="#proceso">How It Works</a>
          </motion.div>
        </div>

        <ul className="footer-tags">
          <li>AI Agents</li>
          <li>Automation</li>
          <li>Integrations</li>
        </ul>
      </motion.div>
    </section>
  )
}

function Services() {
  return (
    <section className="section" id="servicios">
      <motion.div className="section-head" {...reveal}>
        <p className="eyebrow"><span className="dot" />Servicios</p>
        <h2 className="section-title">
          Inteligencia artificial que
          <br />
          trabaja para tu negocio.
        </h2>
      </motion.div>

      <div className="service-grid">
        {SERVICES.map(({ icon: Icon, title, text }, i) => (
          <motion.article
            key={title}
            className="service-card"
            {...reveal}
            transition={{ ...reveal.transition, delay: i * 0.08 }}
          >
            <span className="service-icon"><Icon size={16} strokeWidth={2} /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="section" id="proceso">
      <motion.div className="section-head" {...reveal}>
        <p className="eyebrow"><span className="dot" />Proceso</p>
        <h2 className="section-title">
          De la idea a la operación
          <br />
          automática en semanas.
        </h2>
      </motion.div>

      <ol className="process-list">
        {PROCESS.map((p, i) => (
          <motion.li key={p.n} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
            <span className="process-n">{p.n}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}

function CtaBand({ onOpenQuiz }) {
  return (
    <section className="section" id="diagnostico">
      <motion.div className="cta-band" {...reveal}>
        <div>
          <p className="eyebrow eyebrow-light"><span className="dot dot-light" />Diagnóstico gratuito · 2 minutos</p>
          <h2 className="section-title">
            ¿Qué puede automatizar
            <br />
            la IA en tu negocio?
          </h2>
        </div>
        <button className="btn btn-light btn-icon" type="button" onClick={onOpenQuiz}>
          Empezar diagnóstico <ArrowRight size={14} />
        </button>
      </motion.div>

      <footer className="site-footer">
        <span>© 2026 Neus</span>
      </footer>
    </section>
  )
}

export default function App() {
  const [quizOpen, setQuizOpen] = useState(false)
  const [activeHref, setActiveHref] = useState('#inicio')

  const openQuiz = useCallback(() => setQuizOpen(true), [])
  const closeQuiz = useCallback(() => setQuizOpen(false), [])

  // Highlight the nav pill of the section currently in view.
  useEffect(() => {
    const ids = ['inicio', 'servicios', 'proceso', 'diagnostico']
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <main className="page">
      <Navbar activeHref={activeHref} onOpenQuiz={openQuiz} />
      <Hero />
      <Services />
      <Process />
      <CtaBand onOpenQuiz={openQuiz} />
      <Quiz open={quizOpen} onClose={closeQuiz} />
    </main>
  )
}
