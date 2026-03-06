import { NextRequest, NextResponse } from "next/server"
import { verifyBuildCompatibility, getCompatibleProductsFilter, calculateBuildWatts, getRecommendedPSUWatts } from "@/lib/compatibility"
import type { PCSlotType } from "@/lib/compatibility"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { build, targetSlot } = body as {
      build: Partial<Record<PCSlotType, string>>
      targetSlot?: PCSlotType
    }

    if (targetSlot) {
      // Get compatible products filter for a specific slot
      const { where, compatibilityWarnings } = await getCompatibleProductsFilter(targetSlot, build)
      const watts = await calculateBuildWatts(build)
      const psuRec = await getRecommendedPSUWatts(watts)

      return NextResponse.json({
        where,
        compatibilityWarnings,
        totalWatts: watts,
        psuRecommendation: psuRec,
      })
    }

    // Full build verification
    const result = await verifyBuildCompatibility(build)
    const watts = await calculateBuildWatts(build)
    const psuRec = await getRecommendedPSUWatts(watts)

    return NextResponse.json({
      ...result,
      totalWatts: watts,
      psuRecommendation: psuRec,
    })
  } catch (error) {
    console.error("Compatibility check error:", error)
    return NextResponse.json(
      { compatible: false, errors: ["Error al verificar compatibilidad"], warnings: [] },
      { status: 500 }
    )
  }
}
