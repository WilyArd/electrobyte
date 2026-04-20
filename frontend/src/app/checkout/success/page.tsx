import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  let order = null;
  if (orderId) {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, image: true } },
          },
        },
      },
    });
  }

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen flex items-center justify-center">
      <div className="max-w-lg mx-4 w-full">
        <div className="glass-card p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-heading text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-navy-400 dark:text-navy-200 mb-6">
            Thank you for shopping with ElectroByte
          </p>

          {order && (
            <div className="text-left mb-6 p-4 rounded-xl bg-primary-50/50 dark:bg-navy-600/30 border border-primary-100/20 dark:border-navy-500/30">
              <p className="text-sm text-navy-400 dark:text-navy-300 mb-1">Order ID</p>
              <p className="font-mono text-sm font-medium mb-3">{order.id}</p>
              <p className="text-sm text-navy-400 dark:text-navy-300 mb-1">Total</p>
              <p className="font-heading font-bold text-lg gradient-text mb-3">
                {formatPrice(order.total)}
              </p>
              <p className="text-sm text-navy-400 dark:text-navy-300 mb-1">Items</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span>{item.quantity}x</span>
                    <span className="truncate">{item.product.name}</span>
                    <span className="ml-auto font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products" className="btn-primary flex-1 text-center">
              Continue Shopping
            </Link>
            <Link href="/" className="btn-secondary flex-1 text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
