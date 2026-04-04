import type { Metadata } from 'next'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'Privacy Policy | PhotoTools',
  description:
    'Learn how PhotoTools handles your data, including analytics, cookies, and contact form submissions at www.phototools.io.',
  alternates: {
    canonical: 'https://www.phototools.io/privacy',
  },
}

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | PhotoTools',
    url: 'https://www.phototools.io/privacy',
    description: metadata.description,
  }

  return (
    <div
      style={{
        padding: 'var(--space-xl) var(--space-md)',
        maxWidth: 800,
        margin: '0 auto',
        overflowY: 'auto',
      }}
    >
      <JsonLd data={jsonLd} />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Effective date: April 3, 2026
      </p>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Overview
        </h2>
        <p>
          PhotoTools operates www.phototools.io, a free educational photography resource offering
          interactive calculators, simulators, and reference tools. This Privacy Policy describes
          how we collect, use, and handle information when you visit or use our site. By using
          PhotoTools, you agree to the practices described in this policy.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Information We Collect
        </h2>
        <p>We collect minimal information to operate and improve the site:</p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <strong>Analytics:</strong> We use Google Analytics to understand how visitors use the
          site (e.g. pages visited, time on page, device type). Analytics data is anonymized — we
          do not collect personally identifiable information through analytics. IP addresses are
          anonymized before storage.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <strong>Contact form:</strong> If you submit the contact form, we collect your name,
          email address, subject, and message. This information is used solely to respond to your
          inquiry and is not stored beyond email delivery — it is not saved to a database or
          retained long-term.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <strong>No accounts:</strong> PhotoTools does not require user registration or accounts.
          We do not collect passwords or payment information.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Cookies</h2>
        <p>
          PhotoTools uses cookies to support analytics and advertising functionality. Specifically:
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <strong>Google Analytics cookies</strong> track site usage in aggregate and anonymized
          form. These cookies help us understand which tools are most used and how to improve the
          site.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <strong>Third-party advertising cookies</strong> may be set by our ad network partners to
          serve relevant advertisements and measure ad performance.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          You can control or disable cookies through your browser settings. Note that disabling
          cookies may affect the functionality of some features.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Third-Party Advertising
        </h2>
        <p>
          PhotoTools displays advertisements served by third-party ad networks. These networks may
          use cookies and similar tracking technologies to serve ads based on your browsing history
          and interests (interest-based advertising). We do not control the data practices of these
          third-party ad networks. For more information, please review the privacy policies of those
          networks or visit the{' '}
          <a
            href="https://optout.networkadvertising.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)' }}
          >
            Network Advertising Initiative opt-out page
          </a>
          .
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Data Sharing
        </h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We share data
          only in the following limited circumstances:
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          With <strong>Google Analytics</strong> to analyze site traffic and usage patterns, subject
          to Google&apos;s privacy policy.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          With <strong>advertising partners</strong> as described above under Third-Party
          Advertising.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          We do not share contact form submissions with any third party.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Children&apos;s Privacy
        </h2>
        <p>
          PhotoTools is not directed at children under the age of 13. We do not knowingly collect
          personal information from children under 13. If you believe a child under 13 has provided
          us with personal information, please contact us so we can remove it.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Your Rights
        </h2>
        <p>
          Depending on your location, you may have rights under laws such as the GDPR (European
          Union) or CCPA (California) regarding your personal data.
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          Because PhotoTools collects minimal personal data — and does not store contact form
          submissions long-term — most requests can be addressed simply. You can clear cookies at
          any time through your browser settings. To exercise any data rights or submit a privacy
          request, please use our{' '}
          <a href="/contact" style={{ color: 'var(--accent)' }}>
            contact page
          </a>
          .
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, the updated policy will
          be posted on this page with a revised effective date. We encourage you to review this
          policy periodically. Continued use of PhotoTools after any changes constitutes your
          acceptance of the updated policy.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Contact</h2>
        <p>
          If you have questions about this Privacy Policy or how we handle your data, please reach
          out via our{' '}
          <a href="/contact" style={{ color: 'var(--accent)' }}>
            contact page
          </a>
          .
        </p>
      </section>
    </div>
  )
}
