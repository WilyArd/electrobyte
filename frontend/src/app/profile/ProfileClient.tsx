"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

interface ProfileClientProps {
  session: any;
  profile: any;
  orders: any[];
}

export function ProfileClient({ session, profile, orders }: ProfileClientProps) {
  const user = profile || session?.user;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header */}
        <div className="card-glass rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-glow">
              <span className="text-white text-3xl font-bold font-heading">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-heading">
                {user?.name || "User"}
              </h1>
              <p className="text-navy-400 dark:text-navy-200 mt-1">
                {user?.email}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 font-medium border border-primary-500/20">
                  {user?.role || "USER"}
                </span>
                <span className="text-xs text-navy-400 dark:text-navy-300">
                  Member since {memberSince}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-5 py-2.5 text-sm font-medium rounded-xl border border-danger-500/30 text-danger-500 hover:bg-danger-500/10 transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold gradient-text">
              {profile?._count?.orders || 0}
            </p>
            <p className="text-sm text-navy-400 dark:text-navy-200 mt-1">
              Total Orders
            </p>
          </div>
          <div className="card-glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold gradient-text">
              {profile?._count?.cartItems || 0}
            </p>
            <p className="text-sm text-navy-400 dark:text-navy-200 mt-1">
              Items in Cart
            </p>
          </div>
          <div className="card-glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold gradient-text">
              $
              {orders
                .reduce((sum: number, o: any) => sum + (o.total || 0), 0)
                .toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-navy-400 dark:text-navy-200 mt-1">
              Total Spent
            </p>
          </div>
        </div>

        {/* Order History */}
        <div className="card-glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-primary-100/10 dark:border-navy-500/30">
            <h2 className="text-lg font-bold font-heading">
              Order <span className="gradient-text">History</span>
            </h2>
          </div>
          {orders.length > 0 ? (
            <div className="divide-y divide-primary-100/10 dark:divide-navy-500/30">
              {orders.map((order: any) => (
                <div key={order.id} className="p-6 hover:bg-primary-50/5 dark:hover:bg-navy-600/20 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div>
                      <p className="font-medium text-sm">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-navy-400 dark:text-navy-300 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium border ${
                          order.status === "COMPLETED"
                            ? "bg-success-500/10 text-success-500 border-success-500/20"
                            : order.status === "CANCELLED"
                            ? "bg-danger-500/10 text-danger-500 border-danger-500/20"
                            : "bg-warning-500/10 text-warning-500 border-warning-500/20"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="font-bold">
                        ${order.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {order.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 bg-primary-50/5 dark:bg-navy-600/30 rounded-lg px-3 py-2"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div>
                          <p className="text-xs font-medium truncate max-w-[140px]">
                            {item.product.name}
                          </p>
                          <p className="text-[10px] text-navy-400 dark:text-navy-300">
                            x{item.quantity} · ${item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <svg
                className="w-16 h-16 mx-auto text-navy-300/30 dark:text-navy-500/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="text-navy-400 dark:text-navy-200 mt-4 font-medium">
                No orders yet
              </p>
              <p className="text-sm text-navy-400/60 dark:text-navy-300/60 mt-1">
                Start shopping to see your order history here
              </p>
              <Link
                href="/products"
                className="btn-primary inline-block mt-6 !px-6 !py-2.5"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
