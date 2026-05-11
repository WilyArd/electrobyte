"use client";

import { login, loginWithGoogle } from "@/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import { useTranslation } from "@/contexts/I18nContext";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const { t } = useTranslation();

  return (
    <div className="pt-24 lg:pt-28 pb-16 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-500/8 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md mx-4 z-10">
        <div className="glass-card p-8 lg:p-10 animate-fade-in-up hover:transform-none">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="animated-border w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <div className="w-full h-full rounded-2xl gradient-bg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-2xl">E</span>
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold mb-2">{t("auth.login.title")}</h1>
            <p className="text-navy-400 dark:text-navy-200">{t("auth.login.subtitle")}</p>
          </div>

          {/* Google OAuth */}
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-primary-100/20 dark:border-navy-500/30 hover:bg-primary-50 dark:hover:bg-navy-600 hover:border-primary-500/20 transition-all duration-300 mb-6 group"
              id="google-login"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-medium group-hover:text-primary-500 transition-colors">Continue with Google</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full section-divider" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-[rgba(17,29,51,0.7)] text-navy-400 dark:text-navy-300">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Error */}
          {state?.error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm animate-scale-in">
              {state.error}
            </div>
          )}

          {/* Credentials Form */}
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                {t("auth.login.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                {t("auth.login.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
              id="login-submit"
            >
              {isPending ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("settings.saving")}
                </>
              ) : (
                t("auth.login.button")
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-navy-400 dark:text-navy-300 mt-6">
            {t("auth.login.noAccount")}{" "}
            <Link href="/auth/register" className="text-primary-500 hover:underline font-semibold">
              {t("auth.login.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
