import './globals.css'

// Synchronously sets `data-theme` on <html> from localStorage before React
// paints, so the saved theme persists across navigations (including locale
// switches that remount layouts) without a flash of the default theme.
const themeInitScript = `(function(){try{var t=localStorage.getItem('phototools-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="facebook-domain-verification" content="ggwy69tbq5cn3pvypxdvay1xl6ykjs" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
