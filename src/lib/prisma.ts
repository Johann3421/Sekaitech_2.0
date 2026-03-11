import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: any }

function makeMockPrisma() {
	const methodHandler = (_target: any, prop: string) => {
		// return functions for common query methods
		if (/[Ff]ind|count|groupBy|aggregate|search|list/.test(prop)) {
			return async () => {
				// findMany / groupBy -> empty array
				return []
			}
		}
		if (/[Ff]ind(U|u)nique|[Ff]ind[Ff]irst/.test(prop)) {
			return async () => null
		}
		if (prop === 'count') return async () => 0
		// default: return a noop async function
		return async () => null
	}

	const modelProxy = new Proxy({}, {
		get: (_t, p: string) => new Proxy(() => {}, { apply: () => methodHandler(null, p) })
	})

	// allow prisma.$disconnect etc. to be no-ops
	const topLevel = new Proxy(modelProxy, {
		get: (t, p: string) => {
			if (p === '$disconnect' || p === '$connect' || p === '$on' || p === '$transaction') {
				return async () => null
			}
			// models
			return (modelProxy as any)[p as any]
		}
	})

	return topLevel
}

const shouldSkipDb = process.env.SKIP_DB_DURING_BUILD === '1' || process.env.SKIP_DB_DURING_BUILD === 'true'

export const prisma = shouldSkipDb
	? (globalForPrisma.prisma = globalForPrisma.prisma || makeMockPrisma())
	: (globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient({ log: ["error"] }))

if (!shouldSkipDb && process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
