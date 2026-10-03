// Synthetic fixture: the reduce on line 6 looks unsafe in isolation, but the guard above makes it safe.
export function total(order: { items?: number[] } | undefined): number {
  if (!order || !order.items) {
    return 0;
  }
  return order.items.reduce((sum, n) => sum + n, 0);
}
