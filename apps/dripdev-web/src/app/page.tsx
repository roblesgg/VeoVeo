'use client'

import React from 'react'
import { motion } from 'framer-motion'
import LiquidGlass from '@/components/LiquidGlass'

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="logo">DRIPDEV</div>
        <div style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 600 }}>v1.0</div>
      </nav>

      <LiquidGlass />

      <div className="overlay">
        <motion.p 
          className="tagline"
          initial={{ opacity: 0, letterSpacing: '0.5rem' }}
          whileInView={{ opacity: 1, letterSpacing: '0.2rem' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          Crafting Digital Gems
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        >
          DripDev
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <a 
            href="https://veoveo.dripdev.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="cta-button"
          >
            Explorar VeoVeo
          </a>
        </motion.div>
      </div>
      
      <footer style={{ 
        position: 'fixed', 
        bottom: 30, 
        width: '100%', 
        textAlign: 'center', 
        color: 'rgba(255,255,255,0.1)',
        fontSize: '0.7rem',
        letterSpacing: '2px'
      }}>
        © 2026 DRIPDEV STUDIO
      </footer>
    </main>
  )
}
