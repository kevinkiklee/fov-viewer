interface ShortcutOverlayProps {
  visible: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'Tab', description: 'Switch active lens (A / B)' },
  { key: '[', description: 'Previous focal length preset' },
  { key: ']', description: 'Next focal length preset' },
  { key: 'S', description: 'Toggle Overlay / Side by Side' },
  { key: 'T', description: 'Toggle Dark / Light theme' },
  { key: '?', description: 'Show / hide this cheat sheet' },
]

export function ShortcutOverlay({ visible, onClose }: ShortcutOverlayProps) {
  if (!visible) return null

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-overlay__card" onClick={(e) => e.stopPropagation()}>
        <div className="shortcut-overlay__header">
          <h3>Keyboard Shortcuts</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="shortcut-overlay__list">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="shortcut-overlay__row">
              <kbd className="shortcut-overlay__key">{s.key}</kbd>
              <span>{s.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
