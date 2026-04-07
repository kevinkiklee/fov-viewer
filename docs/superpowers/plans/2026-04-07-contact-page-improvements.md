# Contact Page Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the contact page with a two-column layout (form + info sidebar), a category dropdown, a nav bar link, and translations for all 31 locales.

**Architecture:** Minimal changes — add one new CSS Module for page layout, modify the existing form component to add a select field, update the API route to accept/validate the new field, add a link to the nav bar, and extend translation files. The server/client boundary stays the same: page.tsx is server, ContactForm.tsx is client.

**Tech Stack:** Next.js 16 App Router, next-intl, CSS Modules, Resend API

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `src/app/[locale]/contact/ContactPage.module.css` | Page-level two-column grid layout, info sidebar card styling, responsive breakpoint |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/[locale]/contact/page.tsx` | Two-column grid with info sidebar, CSS Module import, replace inline styles |
| `src/app/[locale]/contact/_components/ContactForm.tsx` | Add category `<select>` field between Subject and Message |
| `src/app/[locale]/contact/_components/ContactForm.module.css` | Add `.select` class for the dropdown |
| `src/app/api/contact/route.ts` | Add `category` to interface, validate it, include in email subject+body |
| `src/components/layout/Nav.tsx` | Add Contact link after spacer, before ThemeToggle |
| `src/lib/i18n/messages/en/contact.json` | Add category + sidebar translation keys |
| `src/lib/i18n/messages/en/common.json` | Add `nav.contact` key |
| `src/lib/i18n/messages/{30 other locales}/contact.json` | Add translated category + sidebar keys |
| `src/lib/i18n/messages/{30 other locales}/common.json` | Add translated `nav.contact` key |

---

### Task 1: API Route — Add Category Field

**Files:**
- Modify: `src/app/api/contact/route.ts`

- [ ] **Step 1: Add allowed categories constant and display-label map**

At the top of `src/app/api/contact/route.ts`, after the `EMAIL_REGEX` line (line 33), add:

```typescript
const ALLOWED_CATEGORIES = ['tool-feedback', 'bug-report', 'new-tool-suggestion', 'translation-issue', 'other'] as const
type ContactCategory = typeof ALLOWED_CATEGORIES[number]

const CATEGORY_LABELS: Record<ContactCategory, string> = {
  'tool-feedback': 'Tool Feedback',
  'bug-report': 'Bug Report',
  'new-tool-suggestion': 'New Tool Suggestion',
  'translation-issue': 'Translation Issue',
  'other': 'Other',
}
```

- [ ] **Step 2: Update ContactBody interface**

Change the `ContactBody` interface (line 34) from:

```typescript
interface ContactBody {
  name: string
  email: string
  subject: string
  message: string
  website?: string
}
```

to:

```typescript
interface ContactBody {
  name: string
  email: string
  subject: string
  category: string
  message: string
  website?: string
}
```

- [ ] **Step 3: Add category validation**

After the existing subject validation block (line 80, `subject.length > 200`), add:

```typescript
  if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category as ContactCategory)) {
    return NextResponse.json({ error: 'Please select a valid category.' }, { status: 400 })
  }
```

- [ ] **Step 4: Update the destructuring and email send**

Update the destructuring line (line 66) from:

```typescript
  const { name, email, subject, message } = body
```

to:

```typescript
  const { name, email, subject, category, message } = body
```

Update the `resend.emails.send` call — change the `subject` and `text` fields from:

```typescript
      subject: `[PhotoTools Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
```

to:

```typescript
      subject: `[PhotoTools Contact] [${CATEGORY_LABELS[category as ContactCategory]}] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nCategory: ${CATEGORY_LABELS[category as ContactCategory]}\n\n${message}`,
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/contact/route.ts
git commit -m "feat(contact): add category field to API route with validation"
```

---

### Task 2: Category Dropdown — Form Component

**Files:**
- Modify: `src/app/[locale]/contact/_components/ContactForm.tsx`
- Modify: `src/app/[locale]/contact/_components/ContactForm.module.css`

- [ ] **Step 1: Add `.select` style to CSS Module**

Add after the `.textarea` block (after line 41) in `ContactForm.module.css`:

```css
.select {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-family: inherit;
  transition: border-color var(--duration-fast) var(--ease-out);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-sm) center;
  padding-right: calc(var(--space-md) + 16px);
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: var(--accent);
}

.select:invalid {
  color: var(--text-muted);
}
```

- [ ] **Step 2: Add category select field to the form**

In `ContactForm.tsx`, add the category field after the subject field block (after line 113, the closing `</div>` of the subject field) and before the message field:

```tsx
      <div className={styles.field}>
        <label htmlFor="category" className={styles.label}>{t('categoryLabel')}</label>
        <select
          id="category"
          name="category"
          required
          className={styles.select}
          defaultValue=""
        >
          <option value="" disabled>{t('categoryPlaceholder')}</option>
          <option value="tool-feedback">{t('categoryToolFeedback')}</option>
          <option value="bug-report">{t('categoryBugReport')}</option>
          <option value="new-tool-suggestion">{t('categoryNewToolSuggestion')}</option>
          <option value="translation-issue">{t('categoryTranslationIssue')}</option>
          <option value="other">{t('categoryOther')}</option>
        </select>
      </div>
```

- [ ] **Step 3: Verify the form renders**

Run: `npm run dev`

Open `http://localhost:3000/en/contact` and verify the category dropdown appears between Subject and Message. Select each option to confirm they work. Submit should fail (API now requires category) — that's expected since we haven't added translations yet.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/contact/_components/ContactForm.tsx src/app/[locale]/contact/_components/ContactForm.module.css
git commit -m "feat(contact): add category dropdown to contact form"
```

---

### Task 3: English Translations — Category + Sidebar Keys

**Files:**
- Modify: `src/lib/i18n/messages/en/contact.json`

- [ ] **Step 1: Add new keys to English contact.json**

Replace the full contents of `src/lib/i18n/messages/en/contact.json` with:

```json
{
  "contact": {
    "title": "Contact Us",
    "description": "Have a question, found a bug, or want to suggest a new tool? We'd love to hear from you.",
    "sidebar": {
      "responseTimeTitle": "Response Time",
      "responseTimeText": "We typically reply within 48 hours.",
      "helpfulLinksTitle": "Helpful Links",
      "glossaryLink": "Photography Glossary",
      "aboutLink": "About PhotoTools"
    },
    "form": {
      "nameLabel": "Name",
      "namePlaceholder": "Your name",
      "emailLabel": "Email",
      "emailPlaceholder": "your@email.com",
      "subjectLabel": "Subject",
      "subjectPlaceholder": "What is this about?",
      "categoryLabel": "Category",
      "categoryPlaceholder": "Select a category...",
      "categoryToolFeedback": "Tool Feedback",
      "categoryBugReport": "Bug Report",
      "categoryNewToolSuggestion": "New Tool Suggestion",
      "categoryTranslationIssue": "Translation Issue",
      "categoryOther": "Other",
      "messageLabel": "Message",
      "messagePlaceholder": "Your message...",
      "submit": "Send Message",
      "sending": "Sending...",
      "honeypotLabel": "Website",
      "successToast": "Message sent! We'll get back to you soon.",
      "errorToast": "Something went wrong. Please try again.",
      "networkErrorToast": "Network error. Please check your connection and try again.",
      "sentTitle": "Thanks for reaching out!",
      "sentMessage": "We'll get back to you as soon as possible.",
      "sendAnother": "Send another message"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/i18n/messages/en/contact.json
git commit -m "feat(contact): add English translations for category and sidebar"
```

---

### Task 4: Page Layout — Two-Column Grid with Info Sidebar

**Files:**
- Create: `src/app/[locale]/contact/ContactPage.module.css`
- Modify: `src/app/[locale]/contact/page.tsx`

- [ ] **Step 1: Create the page-level CSS Module**

Create `src/app/[locale]/contact/ContactPage.module.css`:

```css
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md);
  overflow-y: auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-xl);
  align-items: start;
}

.main h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.description {
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.sidebar {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.sidebarSection h3 {
  font-size: var(--text-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent);
  margin-bottom: var(--space-sm);
}

.sidebarText {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.sidebarLinks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.sidebarLink {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-xs) 0;
  transition: color var(--duration-fast) var(--ease-out);
}

.sidebarLink:hover {
  color: var(--accent);
}

@media (max-width: 1023px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Rewrite page.tsx with two-column layout and info sidebar**

Replace the full contents of `src/app/[locale]/contact/page.tsx` with:

```tsx
import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { Link } from '@/lib/i18n/navigation'
import { ContactForm } from './_components/ContactForm'
import styles from './ContactPage.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.contact')
  return {
    title: t('title'),
    description: t('description'),
    alternates: getAlternates('/contact'),
  }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: t('title'),
    url: 'https://www.phototools.io/contact',
  }

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.grid}>
        <div className={styles.main}>
          <h1>{t('title')}</h1>
          <p className={styles.description}>{t('description')}</p>
          <ContactForm />
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3>{t('sidebar.responseTimeTitle')}</h3>
            <p className={styles.sidebarText}>{t('sidebar.responseTimeText')}</p>
          </div>
          <div className={styles.sidebarSection}>
            <h3>{t('sidebar.helpfulLinksTitle')}</h3>
            <ul className={styles.sidebarLinks}>
              <li>
                <Link href="/learn/glossary" className={styles.sidebarLink}>
                  {t('sidebar.glossaryLink')}
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.sidebarLink}>
                  {t('sidebar.aboutLink')}
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify layout in dev server**

Run: `npm run dev`

Open `http://localhost:3000/en/contact`. Verify:
- Two-column layout on desktop (form left, sidebar right)
- Sidebar shows "Response Time" and "Helpful Links" sections
- Glossary and About links work
- Resize to mobile width — layout stacks vertically
- No outer page scroll on desktop

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/contact/ContactPage.module.css src/app/[locale]/contact/page.tsx
git commit -m "feat(contact): two-column layout with info sidebar"
```

---

### Task 5: Nav Link

**Files:**
- Modify: `src/components/layout/Nav.tsx`
- Modify: `src/lib/i18n/messages/en/common.json`

- [ ] **Step 1: Add `nav.contact` key to English common.json**

In `src/lib/i18n/messages/en/common.json`, add `"contact": "Contact"` to the `common.nav` object. Change:

```json
    "nav": {
      "tools": "Tools",
      "glossary": "Glossary",
      "closeMenu": "Close menu",
      "comingSoon": "Soon",
```

to:

```json
    "nav": {
      "tools": "Tools",
      "glossary": "Glossary",
      "contact": "Contact",
      "closeMenu": "Close menu",
      "comingSoon": "Soon",
```

- [ ] **Step 2: Add Contact link to Nav.tsx**

In `src/components/layout/Nav.tsx`, insert a Contact link after the spacer div (line 166) and before the ThemeToggle span (line 167). Change:

```tsx
        <div className={styles.spacer} />
        <span className={styles.desktopThemeToggle}><ThemeToggle theme={theme} onChange={onThemeChange} /></span>
```

to:

```tsx
        <div className={styles.spacer} />
        <Link href="/contact" className={styles.navLink}>{t('contact')}</Link>
        <span className={styles.desktopThemeToggle}><ThemeToggle theme={theme} onChange={onThemeChange} /></span>
```

- [ ] **Step 3: Verify in dev server**

Run: `npm run dev`

Open `http://localhost:3000/en/contact`. Verify:
- "Contact" link appears in the nav after the spacer, before theme/language controls
- Clicking it navigates to the contact page
- Style matches the Glossary link

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Nav.tsx src/lib/i18n/messages/en/common.json
git commit -m "feat(contact): add Contact link to top nav bar"
```

---

### Task 6: Translations — 30 Non-English Locales

**Files:**
- Modify: `src/lib/i18n/messages/{locale}/contact.json` (×30 locales)
- Modify: `src/lib/i18n/messages/{locale}/common.json` (×30 locales)

The 30 non-English locales: `bn`, `ca`, `cs`, `da`, `de`, `el`, `es`, `fi`, `fil`, `fr`, `hi`, `hu`, `id`, `it`, `ja`, `ko`, `ms`, `nb`, `nl`, `pl`, `pt`, `ro`, `ru`, `sv`, `th`, `tr`, `uk`, `vi`, `zh`, `zh-TW`

For each locale, two changes are needed:

#### A. Add keys to `contact.json`

Add these keys to each locale's `contact.json`, inside the `"contact"` object. The new keys are `"sidebar"` (sibling to `"form"`) and category keys inside `"form"`. All values must be translated into the target language — do NOT leave English text. Use `src/lib/i18n/glossary.photography.json` for terminology reference.

New keys to add to `contact.form`:
```json
"categoryLabel": "...",
"categoryPlaceholder": "...",
"categoryToolFeedback": "...",
"categoryBugReport": "...",
"categoryNewToolSuggestion": "...",
"categoryTranslationIssue": "...",
"categoryOther": "..."
```

New sibling object to add alongside `contact.form`:
```json
"sidebar": {
  "responseTimeTitle": "...",
  "responseTimeText": "...",
  "helpfulLinksTitle": "...",
  "glossaryLink": "...",
  "aboutLink": "..."
}
```

**Reference translations for the 5 original locales (es, ja, de, fr):**

**Spanish (es):**
```json
"sidebar": {
  "responseTimeTitle": "Tiempo de respuesta",
  "responseTimeText": "Normalmente respondemos en un plazo de 48 horas.",
  "helpfulLinksTitle": "Enlaces útiles",
  "glossaryLink": "Glosario de fotografía",
  "aboutLink": "Acerca de PhotoTools"
},
"categoryLabel": "Categoría",
"categoryPlaceholder": "Selecciona una categoría...",
"categoryToolFeedback": "Comentarios sobre herramientas",
"categoryBugReport": "Reporte de error",
"categoryNewToolSuggestion": "Sugerencia de nueva herramienta",
"categoryTranslationIssue": "Problema de traducción",
"categoryOther": "Otro"
```

**Japanese (ja):**
```json
"sidebar": {
  "responseTimeTitle": "返信時間",
  "responseTimeText": "通常48時間以内にご返信いたします。",
  "helpfulLinksTitle": "お役立ちリンク",
  "glossaryLink": "写真用語集",
  "aboutLink": "PhotoToolsについて"
},
"categoryLabel": "カテゴリー",
"categoryPlaceholder": "カテゴリーを選択...",
"categoryToolFeedback": "ツールへのフィードバック",
"categoryBugReport": "バグ報告",
"categoryNewToolSuggestion": "新しいツールの提案",
"categoryTranslationIssue": "翻訳の問題",
"categoryOther": "その他"
```

**German (de):**
```json
"sidebar": {
  "responseTimeTitle": "Antwortzeit",
  "responseTimeText": "Wir antworten in der Regel innerhalb von 48 Stunden.",
  "helpfulLinksTitle": "Nützliche Links",
  "glossaryLink": "Fotografie-Glossar",
  "aboutLink": "Über PhotoTools"
},
"categoryLabel": "Kategorie",
"categoryPlaceholder": "Kategorie auswählen...",
"categoryToolFeedback": "Tool-Feedback",
"categoryBugReport": "Fehlerbericht",
"categoryNewToolSuggestion": "Neues Tool vorschlagen",
"categoryTranslationIssue": "Übersetzungsproblem",
"categoryOther": "Sonstiges"
```

**French (fr):**
```json
"sidebar": {
  "responseTimeTitle": "Délai de réponse",
  "responseTimeText": "Nous répondons généralement sous 48 heures.",
  "helpfulLinksTitle": "Liens utiles",
  "glossaryLink": "Glossaire photo",
  "aboutLink": "À propos de PhotoTools"
},
"categoryLabel": "Catégorie",
"categoryPlaceholder": "Sélectionnez une catégorie...",
"categoryToolFeedback": "Avis sur les outils",
"categoryBugReport": "Signaler un bug",
"categoryNewToolSuggestion": "Suggestion de nouvel outil",
"categoryTranslationIssue": "Problème de traduction",
"categoryOther": "Autre"
```

For all other locales, translate from English into the target language following the same key structure. Keep "PhotoTools" as-is (brand name).

#### B. Add `nav.contact` to `common.json`

For each locale's `common.json`, add `"contact": "..."` to the `common.nav` object. Use the translation already present in `common.footer.contact` from the same file as reference — in many languages the word is the same.

**Reference for original locales:**
- es: `"contact": "Contacto"`
- ja: `"contact": "お問い合わせ"`
- de: `"contact": "Kontakt"`
- fr: `"contact": "Contact"`

- [ ] **Step 1: Update all 30 locale contact.json files**

Add the `sidebar` object and category keys to each locale's `contact.json`. Follow the structure and reference translations above.

- [ ] **Step 2: Update all 30 locale common.json files**

Add `"contact": "..."` to the `common.nav` object in each locale's `common.json`.

- [ ] **Step 3: Run translation verification scripts**

```bash
node scripts/check-translations.mjs
node scripts/find-english-leaks.mjs
```

Both should exit 0. Fix any missing keys or English leaks flagged.

- [ ] **Step 4: Commit**

```bash
git add src/lib/i18n/messages/
git commit -m "feat(contact): add category and sidebar translations for all 31 locales"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

All 724+ tests should pass. If any i18n tests fail due to the new keys, check that the key structure matches across all locales.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Should exit 0.

- [ ] **Step 3: Run a production build**

```bash
npm run build
```

Should complete with no errors. Watch for `MISSING_MESSAGE` warnings — these indicate a locale is missing a translation key.

- [ ] **Step 4: Manual smoke test**

Start the production server:
```bash
npm run start
```

Verify in browser:
1. `/en/contact` — two-column layout, category dropdown works, sidebar shows response time + links
2. `/ja/contact` — Japanese translations render, no English leaks in form labels or sidebar
3. Nav bar — "Contact" link visible on all pages, navigates correctly
4. Submit the form (if RESEND_API_KEY is configured) — email should include `[Category]` in subject
5. Resize to mobile — layout stacks, page scrolls naturally

- [ ] **Step 5: Commit any fixes from verification**

If verification revealed issues, commit the fixes:
```bash
git add -A
git commit -m "fix(contact): address issues found during verification"
```
