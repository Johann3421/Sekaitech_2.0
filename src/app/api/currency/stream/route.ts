import { NextResponse } from "next/server"
import { getCurrencySubscribers } from "@/lib/sse"

export const dynamic = "force-dynamic"

export async function GET() {
  const subscribers = getCurrencySubscribers()
  let ctrl: ReadableStreamDefaultController
  const stream = new ReadableStream({
    start(c) {
      ctrl = c
      subscribers.add(c)
      const hb = setInterval(() => {
        try {
          c.enqueue(new TextEncoder().encode(": ping\n\n"))
        } catch {
          clearInterval(hb)
        }
      }, 30000)
    },
    cancel() {
      subscribers.delete(ctrl!)
    },
  })
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
