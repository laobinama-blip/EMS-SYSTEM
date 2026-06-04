import { describe, expect, it } from 'vitest'
import { buildBomQuote } from './bomMath'

describe('buildBomQuote', () => {
  it('recommends the 50 vehicle tier without HA', () => {
    const quote = buildBomQuote({
      vehicleLimit: 50,
      highAvailability: false,
      backupStorage: false,
      gpuAcceleration: false,
      supportYears: 1,
    })

    expect(quote.tier.label).toBe('50辆以下')
    expect(quote.lines.find((line) => line.id === 'app-server')?.quantity).toBe(1)
    expect(quote.summary.total).toBe(206000)
  })

  it('doubles core nodes and reports HA uplift when HA is enabled', () => {
    const quote = buildBomQuote({
      vehicleLimit: 100,
      highAvailability: true,
      backupStorage: false,
      gpuAcceleration: false,
      supportYears: 1,
    })

    expect(quote.tier.label).toBe('100辆以下')
    expect(quote.lines.find((line) => line.id === 'app-server')?.quantity).toBe(2)
    expect(quote.lines.find((line) => line.id === 'db-server')?.quantity).toBe(2)
    expect(quote.summary.haUplift).toBeGreaterThan(0)
    expect(quote.summary.total).toBe(589000)
  })

  it('adds GPU, backup storage, and extended support to large deployments', () => {
    const quote = buildBomQuote({
      vehicleLimit: 500,
      highAvailability: true,
      backupStorage: true,
      gpuAcceleration: true,
      supportYears: 3,
    })

    expect(quote.tier.label).toBe('500辆以下')
    expect(quote.lines.find((line) => line.id === 'gpu-accelerator')?.quantity).toBe(1)
    expect(quote.lines.find((line) => line.id === 'backup-storage')?.quantity).toBe(1)
    expect(quote.lines.find((line) => line.id === 'support')?.quantity).toBe(3)
    expect(quote.summary.total).toBe(1993000)
  })
})
