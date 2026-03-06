import { prisma } from "./prisma"

export type PCSlotType = "CPU" | "MOTHERBOARD" | "RAM" | "GPU" | "STORAGE" | "PSU" | "CASE" | "COOLER"

export interface CompatibilityFilter {
  slot: PCSlotType
  currentBuild: Partial<Record<PCSlotType, string>>
}

export interface CompatibilityResult {
  compatible: boolean
  warnings: string[]
  errors: string[]
}

/**
 * Generates Prisma WHERE filters to show only products compatible with current build.
 */
export async function getCompatibleProductsFilter(
  targetSlot: PCSlotType,
  currentBuild: Partial<Record<PCSlotType, string>>
): Promise<{ where: Record<string, unknown>; compatibilityWarnings: string[] }> {
  const warnings: string[] = []
  const filter: Record<string, unknown> = { published: true, stock: { gt: 0 } }

  const selectedProducts = await prisma.productCompatibility.findMany({
    where: {
      productId: { in: Object.values(currentBuild).filter(Boolean) as string[] },
    },
  })

  const cpu = selectedProducts.find((p) =>
    Object.entries(currentBuild).find(([slot, id]) => slot === "CPU" && id === p.productId)
  )
  const mobo = selectedProducts.find((p) =>
    Object.entries(currentBuild).find(([slot, id]) => slot === "MOTHERBOARD" && id === p.productId)
  )

  switch (targetSlot) {
    case "MOTHERBOARD":
      if (cpu?.socket) {
        filter.compatibility = { socket: cpu.socket }
        warnings.push(`Filtrando placas compatibles con socket ${cpu.socket}`)
      }
      break

    case "RAM":
      if (mobo?.memoryType) {
        filter.compatibility = { ramType: mobo.memoryType }
        warnings.push(`Filtrando RAM ${mobo.memoryType} compatible con tu placa`)
      } else if (cpu?.socket) {
        if (cpu.socket === "AM5") {
          filter.compatibility = { ramType: "DDR5" }
          warnings.push("AM5 requiere DDR5. Mostrando solo RAM DDR5.")
        } else if (cpu.socket === "AM4") {
          filter.compatibility = { ramType: "DDR4" }
          warnings.push("AM4 requiere DDR4. Mostrando solo RAM DDR4.")
        }
      }
      break

    case "COOLER":
      if (cpu?.socket) {
        filter.compatibility = {
          coolerSocketsSupported: { has: cpu.socket },
        }
        warnings.push(`Filtrando coolers compatibles con socket ${cpu.socket}`)
      }
      break

    case "CASE":
      if (mobo?.formFactor) {
        filter.compatibility = {
          caseFormFactor: { contains: mobo.formFactor },
        }
        warnings.push(`Mostrando cases para placa ${mobo.formFactor}`)
      }
      break

    case "PSU": {
      const totalWatts = await calculateBuildWatts(currentBuild)
      if (totalWatts > 0) {
        const recommendedWatts = Math.ceil((totalWatts * 1.2) / 50) * 50
        filter.compatibility = { psuWatts: { gte: recommendedWatts } }
        warnings.push(`Recomendando PSU de ${recommendedWatts}W+ para tu build de ${totalWatts}W`)
      }
      break
    }
  }

  return { where: filter, compatibilityWarnings: warnings }
}

/**
 * Calculates total watt consumption of the current build
 */
export async function calculateBuildWatts(
  currentBuild: Partial<Record<PCSlotType, string>>
): Promise<number> {
  const productIds = Object.values(currentBuild).filter(Boolean) as string[]
  if (productIds.length === 0) return 0

  const compatibilities = await prisma.productCompatibility.findMany({
    where: { productId: { in: productIds } },
    select: { tdpWatts: true, gpuTdpWatts: true },
  })

  return compatibilities.reduce((total, c) => {
    return total + (c.tdpWatts ?? 0) + (c.gpuTdpWatts ?? 0)
  }, 65) // +65W base for motherboard, RAM, storage, peripherals
}

/**
 * Gets PSU recommendation based on build wattage
 */
export async function getRecommendedPSUWatts(buildWatts: number): Promise<{
  minWatts: number
  recommended: number
  tier: string
}> {
  const withHeadroom = Math.ceil(buildWatts * 1.2)
  const rec = await prisma.pSURecommendation.findFirst({
    where: {
      minWatts: { lte: withHeadroom },
      maxWatts: { gte: withHeadroom },
    },
  })
  return {
    minWatts: buildWatts,
    recommended: rec?.recommended ?? withHeadroom,
    tier: rec?.tier ?? "Enthusiast",
  }
}

/**
 * Verifies full build compatibility. Returns errors and warnings.
 */
export async function verifyBuildCompatibility(
  build: Partial<Record<PCSlotType, string>>
): Promise<CompatibilityResult> {
  const errors: string[] = []
  const warnings: string[] = []

  const productIds = Object.values(build).filter(Boolean) as string[]
  const specs = await prisma.productCompatibility.findMany({
    where: { productId: { in: productIds } },
    include: { product: { select: { name: true } } },
  })

  const bySlot = Object.entries(build).reduce(
    (acc, [slot, id]) => {
      const spec = specs.find((s) => s.productId === id)
      if (spec) acc[slot as PCSlotType] = spec
      return acc
    },
    {} as Partial<Record<PCSlotType, (typeof specs)[0]>>
  )

  // CPU ↔ Motherboard
  if (bySlot.CPU && bySlot.MOTHERBOARD) {
    if (bySlot.CPU.socket !== bySlot.MOTHERBOARD.socket) {
      errors.push(
        `❌ Incompatible: ${bySlot.CPU.product.name} usa socket ${bySlot.CPU.socket} pero la placa soporta ${bySlot.MOTHERBOARD.socket}`
      )
    }
  }

  // RAM ↔ Motherboard
  if (bySlot.RAM && bySlot.MOTHERBOARD) {
    if (bySlot.RAM.ramType !== bySlot.MOTHERBOARD.memoryType) {
      errors.push(
        `❌ Incompatible: La RAM es ${bySlot.RAM.ramType} pero la placa soporta ${bySlot.MOTHERBOARD.memoryType}`
      )
    }
  }

  // Cooler ↔ CPU
  if (bySlot.COOLER && bySlot.CPU) {
    const supported = bySlot.COOLER.coolerSocketsSupported ?? []
    if (bySlot.CPU.socket && !supported.includes(bySlot.CPU.socket)) {
      errors.push(`❌ El cooler no es compatible con socket ${bySlot.CPU.socket}`)
    }
  }

  // PSU
  if (bySlot.PSU) {
    const totalWatts = await calculateBuildWatts(build)
    const psuWatts = bySlot.PSU.psuWatts ?? 0
    if (psuWatts < totalWatts * 1.1) {
      errors.push(
        `❌ La PSU de ${psuWatts}W es insuficiente. Tu build consume ~${totalWatts}W`
      )
    } else if (psuWatts < totalWatts * 1.2) {
      warnings.push(
        `⚠ La PSU de ${psuWatts}W es ajustada. Recomendamos ${Math.ceil((totalWatts * 1.25) / 50) * 50}W o más`
      )
    }
  }

  // Case ↔ Motherboard
  if (bySlot.CASE && bySlot.MOTHERBOARD) {
    const moboFF = bySlot.MOTHERBOARD.formFactor
    const caseFF = bySlot.CASE.caseFormFactor
    if (moboFF && caseFF && !caseFF.includes(moboFF)) {
      errors.push(`❌ El case no admite placas ${moboFF}`)
    }
  }

  return {
    compatible: errors.length === 0,
    warnings,
    errors,
  }
}
