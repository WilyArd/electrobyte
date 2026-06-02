"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { uploadAvatar } from "@/actions/upload";
import { addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } from "@/actions/profile";
import { useTranslation } from "@/contexts/I18nContext";
import { SettingsModal } from "@/components/profile/SettingsModal";

interface ProfileClientProps {
  session: any;
  profile: any;
  orders: any[];
  paymentMethods?: any[];
}

export function ProfileClient({ session, profile, orders, paymentMethods = [] }: ProfileClientProps) {
  const { update: updateSession } = useSession();
  const user = profile || session?.user;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.image ?? null);
  const { t, language: contextLanguage, setLanguage, currency: contextCurrency, setCurrency, formatCurrency } = useTranslation();

  // Settings State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync saved language & currency to context on first load
  useEffect(() => {
    if (profile?.language && profile.language !== contextLanguage) {
      setLanguage(profile.language);
    }
    if (profile?.currency && profile.currency !== contextCurrency) {
      setCurrency(profile.currency);
    }
  }, [profile?.language, profile?.currency, setLanguage, setCurrency, contextLanguage, contextCurrency]);

  // Payment Method State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState("CREDIT_CARD");
  const [newPaymentProvider, setNewPaymentProvider] = useState("");
  const [newPaymentLast4, setNewPaymentLast4] = useState("");

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const handleAvatarUpload = async (formData: FormData) => {
    const file = formData.get("image") as File;
    const avatarForm = new FormData();
    avatarForm.append("avatar", file);
    const result = await uploadAvatar(avatarForm);
    if (result.url) {
      setAvatarUrl(result.url);
      await updateSession();
    }
    return result;
  };


  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentProvider || !newPaymentLast4) {
      alert("Please fill in all fields.");
      return;
    }
    
    const formData = new FormData();
    formData.append("type", newPaymentType);
    formData.append("provider", newPaymentProvider);
    formData.append("last4", newPaymentLast4);

    const result = await addPaymentMethod(null, formData);
    if (result.error) {
      alert(result.error);
    } else {
      setIsAddingPayment(false);
      setNewPaymentProvider("");
      setNewPaymentLast4("");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      const result = await deletePaymentMethod(id);
      if (result.error) alert(result.error);
    }
  };

  const handleSetDefaultPayment = async (id: string) => {
    const result = await setDefaultPaymentMethod(id);
    if (result.error) alert(result.error);
  };

  return (
    <>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header */}
        <div className="card-glass rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with upload */}
            <div className="relative">
              {avatarUrl ? (
                <div className="relative group">
                  <img
                    src={avatarUrl}
                    alt={user?.name || "User"}
                    className="w-20 h-20 rounded-2xl object-cover shadow-glow"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageUpload
                      onUpload={handleAvatarUpload}
                      shape="circle"
                      label=""
                      currentImageUrl={avatarUrl}
                      className="!gap-0"
                    />
                  </div>
                </div>
              ) : (
                <ImageUpload
                  onUpload={handleAvatarUpload}
                  shape="circle"
                  label="Upload photo"
                  currentImageUrl={null}
                />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-heading">
                {user?.name || "User"}
              </h1>
              <p className="text-navy-400 dark:text-navy-200 mt-1">
                {user?.email}
              </p>
              
              {/* Dropdown Menu */}
              <div className="relative inline-block mt-3">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-primary-100 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200 hover:bg-primary-50 dark:hover:bg-navy-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("settings.title") || "Account Settings"}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-navy-800 shadow-xl border border-primary-100/50 dark:border-navy-600/50 z-20 py-2 animate-in slide-in-from-top-2">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsSettingsModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-navy-700 dark:text-navy-200 hover:bg-primary-50 dark:hover:bg-navy-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        Language & Region
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 font-medium border border-primary-500/20">
                  {user?.role || "USER"}
                </span>
                <span className="text-xs text-navy-400 dark:text-navy-300">
                  Member since {memberSince}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-danger-500/30 text-danger-500 hover:bg-danger-500/10 transition-all duration-300"
              >
                {t("profile.signOut")}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold gradient-text">
              {profile?._count?.orders || 0}
            </p>
            <p className="text-sm text-navy-400 dark:text-navy-200 mt-1">
              {t("profile.totalOrders")}
            </p>
          </div>
          <div className="card-glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold gradient-text">
              {profile?._count?.cartItems || 0}
            </p>
            <p className="text-sm text-navy-400 dark:text-navy-200 mt-1">
              {t("profile.itemsInCart")}
            </p>
          </div>
          <div className="card-glass rounded-xl p-5 text-center">
            <p className="text-3xl font-bold gradient-text">
              {formatCurrency(orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0))}
            </p>
            <p className="text-sm text-navy-400 dark:text-navy-200 mt-1">
              {t("profile.totalSpent")}
            </p>
          </div>
        </div>

        {/* Two Column Layout for Settings & Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Payment Methods */}
          <div className="card-glass rounded-2xl overflow-hidden lg:col-span-2">
            <div className="px-6 py-5 border-b border-primary-100/10 dark:border-navy-500/30 flex justify-between items-center">
              <h2 className="text-lg font-bold font-heading">
                {t("profile.paymentMethods").split(" ")[0]} <span className="gradient-text">{t("profile.paymentMethods").split(" ").slice(1).join(" ")}</span>
              </h2>
              {!isAddingPayment && (
                <button
                  onClick={() => setIsAddingPayment(true)}
                  className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {t("profile.addNew")}
                </button>
              )}
            </div>
            <div className="p-6">
              {isAddingPayment ? (
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <p className="text-xs text-navy-400 dark:text-navy-300 mb-2">
                    This is a simulated payment method form. Do not enter real card details.
                  </p>
                  <div>
                    <select
                      value={newPaymentType}
                      onChange={(e) => setNewPaymentType(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm mb-3"
                    >
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  {newPaymentType === "CREDIT_CARD" && (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Provider (e.g. Visa)"
                        value={newPaymentProvider}
                        onChange={(e) => setNewPaymentProvider(e.target.value)}
                        className="w-1/2 bg-white dark:bg-navy-800 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm"
                        maxLength={20}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last 4 Digits"
                        value={newPaymentLast4}
                        onChange={(e) => setNewPaymentLast4(e.target.value.replace(/\D/g,''))}
                        className="w-1/2 bg-white dark:bg-navy-800 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm"
                        maxLength={4}
                        required
                      />
                    </div>
                  )}
                  {newPaymentType !== "CREDIT_CARD" && (
                    <div>
                      <input
                        type="text"
                        placeholder="Account Email or ID"
                        value={newPaymentProvider}
                        onChange={(e) => setNewPaymentProvider(e.target.value)}
                        className="w-full bg-white dark:bg-navy-800 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm"
                        required
                      />
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setIsAddingPayment(false)} className="flex-1 py-2 rounded-xl border border-navy-200 dark:border-navy-600 text-sm font-medium hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                      Add Method
                    </button>
                  </div>
                </form>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className={`flex items-center justify-between p-4 rounded-xl border ${pm.isDefault ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/10' : 'border-primary-100/30 dark:border-navy-600'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-navy-700 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          {pm.type === "CREDIT_CARD" ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {pm.provider} {pm.type === "CREDIT_CARD" && pm.last4 ? `•••• ${pm.last4}` : ''}
                          </p>
                          <p className="text-xs text-navy-400 dark:text-navy-300">
                            {pm.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!pm.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPayment(pm.id)}
                            className="text-xs px-2 py-1 rounded bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        {pm.isDefault && (
                          <span className="text-xs font-medium text-primary-500 bg-primary-500/10 px-2 py-1 rounded">Default</span>
                        )}
                        <button
                          onClick={() => handleDeletePayment(pm.id)}
                          className="p-1 text-danger-500 hover:bg-danger-500/10 rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-navy-400 dark:text-navy-300">No payment methods added.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="card-glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-primary-100/10 dark:border-navy-500/30">
            <h2 className="text-lg font-bold font-heading">
              {t("profile.orderHistory").split(" ")[0]} <span className="gradient-text">{t("profile.orderHistory").split(" ").slice(1).join(" ")}</span>
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
                        {formatCurrency(order.total)}
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
                            x{item.quantity} · {formatCurrency(item.price)}
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
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentLanguage={profile?.language || "en"}
        currentRegion={profile?.region || "US"}
        currentCurrency={profile?.currency || "USD"}
      />
    </>
  );
}

