"use client";

import { updateProduct } from "@/actions/products";

import { getCategoryLabel } from "@/lib/utils";
import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const categories: string[] = [
  "LAPTOPS", "DESKTOPS", "PERIPHERALS", "COMPONENTS", "NETWORKING", "STORAGE", "ACCESSORIES",
];

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
};

export function EditProductForm({ product }: { product: Product }) {
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(updateProductWithId, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/products");
    }
  }, [state?.success, router]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-navy-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="font-heading text-xl font-bold">Edit Product</h2>
      </div>

      <div className="glass-card p-6 sm:p-8 max-w-2xl">
        {state?.error && (
          <div className="mb-6 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Product Name</label>
            <input id="name" name="name" type="text" required defaultValue={product.name} className="input-field" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
            <textarea id="description" name="description" required rows={4} defaultValue={product.description} className="input-field resize-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">Price ($)</label>
              <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product.price} className="input-field" />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-2">Stock</label>
              <input id="stock" name="stock" type="number" min="0" required defaultValue={product.stock} className="input-field" />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-2">Image URL</label>
            <input id="image" name="image" type="url" required defaultValue={product.image} className="input-field" />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
            <select id="category" name="category" required defaultValue={product.category} className="input-field">
              {categories.map((cat) => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input id="featured" name="featured" type="checkbox" value="true" defaultChecked={product.featured} className="w-4 h-4 rounded accent-primary-500" />
            <label htmlFor="featured" className="text-sm font-medium">Featured Product</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2">
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/products" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
