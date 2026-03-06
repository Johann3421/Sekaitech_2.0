'use client'

import { useState, useMemo } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { useBuilderStore } from '@/store/builder'
import { cn } from '@/lib/utils'
import type { PCSlotType } from '@/types'

const SLOT_LABELS: Record<PCSlotType, string> = {
  CPU: 'Procesador',
  MOTHERBOARD: 'Placa madre',
  RAM: 'Memoria RAM',
  GPU: 'Tarjeta gráfica',
  STORAGE: 'Almacenamiento',
  PSU: 'Fuente de poder',
  CASE: 'Gabinete',
  COOLER: 'Cooler',
}

const ALL_SLOTS: PCSlotType[] = ['CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'STORAGE', 'PSU', 'CASE', 'COOLER']

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#060d16',
    color: '#f0f9ff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3456',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#22d3ee',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#94a3b8',
  },
  buildName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#f0f9ff',
    marginBottom: 16,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0a1628',
    borderBottomWidth: 1,
    borderBottomColor: '#1e3456',
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f1f38',
  },
  tableRowAlt: {
    backgroundColor: '#0a1628',
  },
  slotCol: { width: '25%' },
  nameCol: { width: '50%' },
  priceCol: { width: '25%', textAlign: 'right' },
  cellSlot: {
    fontSize: 9,
    color: '#22d3ee',
    fontFamily: 'Helvetica-Bold',
  },
  cellName: {
    fontSize: 9,
    color: '#f0f9ff',
  },
  cellPrice: {
    fontSize: 9,
    color: '#22d3ee',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  cellEmpty: {
    fontSize: 9,
    color: '#475569',
    fontStyle: 'italic',
  },
  totalSection: {
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#1e3456',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#22d3ee',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0f1f38',
  },
  infoBox: {
    padding: 12,
    backgroundColor: '#0a1628',
    borderRadius: 4,
    width: '48%',
  },
  infoLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#f0f9ff',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#0f1f38',
  },
  footerText: {
    fontSize: 7,
    color: '#475569',
  },
})

interface BuildPDFButtonProps {
  className?: string
}

export function BuildPDFButton({ className }: BuildPDFButtonProps) {
  const [generating, setGenerating] = useState(false)
  const slots = useBuilderStore((s) => s.slots)
  const totalUSD = useBuilderStore((s) => s.totalUSD)
  const buildName = useBuilderStore((s) => s.buildName)
  const compatibilityResult = useBuilderStore((s) => s.compatibilityResult)

  const totalWatts = useMemo(() => {
    return Object.entries(slots).reduce((sum, [key, product]) => {
      if (!product || key === 'PSU' || key === 'CASE') return sum
      return sum + (product.compatibility?.tdpWatts ?? product.compatibility?.gpuTdpWatts ?? 0)
    }, 0)
  }, [slots])

  const filledCount = Object.values(slots).filter(Boolean).length

  async function handleGenerate() {
    if (filledCount === 0) return
    setGenerating(true)
    try {
      const now = new Date()
      const dateStr = now.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const BuildDocument = (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Sekaitech</Text>
              <Text style={styles.subtitle}>PC Builder — Cotización generada el {dateStr}</Text>
            </View>

            {/* Build name */}
            <Text style={styles.buildName}>{buildName}</Text>

            {/* Components table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={styles.slotCol}>
                  <Text style={styles.tableHeaderText}>Componente</Text>
                </View>
                <View style={styles.nameCol}>
                  <Text style={styles.tableHeaderText}>Producto</Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>Precio</Text>
                </View>
              </View>

              {ALL_SLOTS.map((slot, i) => {
                const product = slots[slot]
                return (
                  <View
                    key={slot}
                    style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                  >
                    <View style={styles.slotCol}>
                      <Text style={styles.cellSlot}>{SLOT_LABELS[slot]}</Text>
                    </View>
                    <View style={styles.nameCol}>
                      {product ? (
                        <Text style={styles.cellName}>{product.name}</Text>
                      ) : (
                        <Text style={styles.cellEmpty}>— No seleccionado —</Text>
                      )}
                    </View>
                    <View style={styles.priceCol}>
                      <Text style={product ? styles.cellPrice : styles.cellEmpty}>
                        {product ? `$ ${product.priceUSD.toFixed(2)}` : '—'}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>

            {/* Total */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>$ {totalUSD.toFixed(2)}</Text>
            </View>

            {/* Info boxes */}
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Consumo estimado</Text>
                <Text style={styles.infoValue}>{totalWatts}W</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Compatibilidad</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: compatibilityResult?.compatible
                        ? '#a3e635'
                        : compatibilityResult
                          ? '#fb7185'
                          : '#94a3b8',
                    },
                  ]}
                >
                  {compatibilityResult?.compatible
                    ? '✓ Compatible'
                    : compatibilityResult
                      ? `✗ ${compatibilityResult.errors.length} problema(s)`
                      : 'No verificado'}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Sekaitech — sekaitech.pe
              </Text>
              <Text style={styles.footerText}>
                Precios sujetos a disponibilidad y tipo de cambio
              </Text>
            </View>
          </Page>
        </Document>
      )

      const blob = await pdf(BuildDocument).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${buildName.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Build'}-Sekaitech.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Silently fail — @react-pdf/renderer may not be SSR-compatible
      console.error('Error generating PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={generating || filledCount === 0}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all',
        'bg-void-800 border border-void-500 text-ink-secondary hover:text-ink-primary hover:border-plasma-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {generating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileDown size={16} />
          PDF
        </>
      )}
    </button>
  )
}
