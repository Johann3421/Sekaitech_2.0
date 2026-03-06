// SSE broadcast utilities for currency and ticket streams

const currencySubscribers = new Set<ReadableStreamDefaultController>();

export function getCurrencySubscribers() {
  return currencySubscribers;
}

export function broadcastExchangeRateUpdate(newRate: number) {
  const msg = `data: ${JSON.stringify({ type: 'EXCHANGE_RATE_UPDATED', rate: newRate })}\n\n`;
  currencySubscribers.forEach((ctrl) => {
    try {
      ctrl.enqueue(new TextEncoder().encode(msg));
    } catch {
      currencySubscribers.delete(ctrl);
    }
  });
}

const ticketSubscribers = new Set<ReadableStreamDefaultController>();

export function getTicketSubscribers() {
  return ticketSubscribers;
}

export function broadcastTicketEvent(event: { type: string; ticketId: string; [key: string]: any }) {
  const msg = `data: ${JSON.stringify(event)}\n\n`;
  ticketSubscribers.forEach((ctrl) => {
    try {
      ctrl.enqueue(new TextEncoder().encode(msg));
    } catch {
      ticketSubscribers.delete(ctrl);
    }
  });
}
