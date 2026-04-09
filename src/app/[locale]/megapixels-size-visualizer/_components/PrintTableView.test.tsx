import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { PrintTableView } from './PrintTableView'
import type { MegapixelPreset } from '@/lib/types'

const messages = {
  toolUI: {
    'megapixels-size-visualizer': {
      tableMegapixels: 'MP',
      tableFileSize: 'File size',
      tableCropReach: 'Crop reach',
      printTableCaption: 'Print sizes',
      qualityCellLabel: '{size}, {tier}',
      emptyStatePrintTable: 'Select megapixels',
    },
  },
}

function wrap(children: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

describe('PrintTableView', () => {
  it('renders empty state when no MPs visible', () => {
    render(wrap(
      <PrintTableView
        visibleMps={[]}
        aspectId="3x2"
        units="metric"
        viewingDistance="arms"
        bitDepth="raw14"
      />,
    ))
    expect(screen.getByText('Select megapixels')).toBeInTheDocument()
  })

  it('renders quality cells with tier data attributes', () => {
    const mp: MegapixelPreset = { id: 'mp_24', mp: 24, name: '24 MP', tag: 'ff', color: '#000' }
    render(wrap(
      <PrintTableView
        visibleMps={[mp]}
        aspectId="3x2"
        units="metric"
        viewingDistance="arms"
        bitDepth="raw14"
      />,
    ))
    const cells = screen.getAllByTestId('quality-cell')
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      expect(cell).toHaveAttribute('data-tier')
    }
  })
})
