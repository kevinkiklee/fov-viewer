'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import styles from './ContactForm.module.css'

export function ContactForm() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success('Message sent! We\'ll get back to you soon.')
        setSent(true)
        form.reset()
      } else {
        const body = await res.json()
        toast.error(body.error || 'Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
        <p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Thanks for reaching out!
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setSent(false)}
          style={{
            marginTop: 'var(--space-lg)',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
          }}
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Honeypot — hidden from humans and screen readers */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={100}
          className={styles.input}
          placeholder="Your name"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={styles.input}
          placeholder="your@email.com"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="subject" className={styles.label}>Subject</label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          maxLength={200}
          className={styles.input}
          placeholder="What is this about?"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          className={styles.textarea}
          placeholder="Your message..."
          rows={6}
        />
      </div>

      <button type="submit" disabled={sending} className={styles.submit}>
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
