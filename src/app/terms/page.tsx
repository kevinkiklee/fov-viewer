import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | PhotoTools',
  description:
    'Terms of Service for PhotoTools — learn about acceptable use, intellectual property, disclaimers, and limitations of liability for www.phototools.io.',
  alternates: {
    canonical: 'https://www.phototools.io/terms',
  },
}

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service',
    url: 'https://www.phototools.io/terms',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        Terms of Service
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Effective date: April 3, 2026
      </p>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Acceptance of Terms
        </h2>
        <p>
          By accessing or using www.phototools.io (&quot;PhotoTools&quot; or &quot;the Site&quot;),
          you agree to be bound by these Terms of Service. If you do not agree to these terms,
          please do not use the Site. These terms apply to all visitors and users of PhotoTools.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Description of Service
        </h2>
        <p>
          PhotoTools provides free educational photography tools, including interactive calculators,
          simulators, and reference materials. The Site is intended for informational and
          educational purposes only. All tools are provided at no cost to users and are designed to
          help photographers learn and understand photographic concepts.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          No Warranty
        </h2>
        <p>
          PhotoTools is provided &quot;as is&quot; without any warranty of any kind, express or
          implied. We make no guarantee that the tools, calculators, or information on this site are
          accurate, complete, or suitable for any particular purpose. Results from our tools are
          approximations and should not be relied upon for critical decisions, professional
          work, or situations where precision is essential. Always verify important calculations
          with qualified professionals or authoritative sources.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Intellectual Property
        </h2>
        <p>
          All content on PhotoTools — including text, graphics, tool designs, code, and educational
          materials — is the property of PhotoTools unless otherwise noted. You are welcome to use
          the tools and reference materials for personal and educational purposes. Reproduction,
          redistribution, or commercial use of site content without prior written permission is
          prohibited.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Acceptable Use
        </h2>
        <p>When using PhotoTools, you agree not to:</p>
        <ul style={{ marginTop: 'var(--space-sm)', paddingLeft: 'var(--space-lg)' }}>
          <li>Violate any applicable local, national, or international laws or regulations</li>
          <li>Disrupt or interfere with the site&apos;s operation, servers, or networks</li>
          <li>
            Scrape, crawl, or systematically extract data from the site without prior written
            permission
          </li>
          <li>
            Misrepresent your identity or affiliation in communications with PhotoTools
          </li>
          <li>
            Use the site for any commercial purpose beyond personal reference without permission
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Third-Party Content
        </h2>
        <p>
          PhotoTools displays third-party advertisements and may include links to external websites.
          We are not responsible for the content, accuracy, or practices of third-party advertisers
          or linked sites. The inclusion of any advertisement or external link does not constitute
          an endorsement by PhotoTools. Your interactions with third-party services are governed by
          their own terms and privacy policies.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, PhotoTools and its operators shall not be liable
          for any direct, indirect, incidental, special, or consequential damages arising from your
          use of — or inability to use — the Site or its tools. This includes, without limitation,
          damages resulting from reliance on information or calculations provided by PhotoTools.
          Your use of the Site is entirely at your own risk.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Changes to Terms
        </h2>
        <p>
          We may modify these Terms of Service at any time. Updated terms will be posted on this
          page with a revised effective date. Continued use of PhotoTools after changes are posted
          constitutes your acceptance of the revised terms. We encourage you to review these terms
          periodically.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Contact</h2>
        <p>
          If you have questions about these Terms of Service, please reach out via our{' '}
          <a href="/contact" style={{ color: 'var(--accent)' }}>
            contact page
          </a>
          .
        </p>
      </section>
    </div>
  )
}
