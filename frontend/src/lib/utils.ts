// Category utilities for ElectroByte

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    LAPTOPS: "Laptops",
    DESKTOPS: "Desktops",
    PERIPHERALS: "Peripherals",
    COMPONENTS: "Components",
    NETWORKING: "Networking",
    STORAGE: "Storage",
    ACCESSORIES: "Accessories",
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    LAPTOPS: "💻",
    DESKTOPS: "🖥️",
    PERIPHERALS: "⌨️",
    COMPONENTS: "🔧",
    NETWORKING: "🌐",
    STORAGE: "💾",
    ACCESSORIES: "🎧",
  };
  return icons[category] || "📦";
}

export function getStockStatus(stock: number): {
  label: string;
  color: string;
} {
  if (stock === 0) return { label: "Out of Stock", color: "text-danger-500" };
  if (stock <= 5) return { label: "Low Stock", color: "text-warning-500" };
  return { label: "In Stock", color: "text-accent-500" };
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EB-${timestamp}-${random}`;
}
