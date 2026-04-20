"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-navy-800/80 backdrop-blur-xl shadow-lg border-b border-primary-100/20 dark:border-navy-500/30"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
              <span className="text-white font-heading font-bold text-lg">E</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">
              <span className="gradient-text">Electro</span>
              <span className="text-navy-800 dark:text-white">Byte</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/cart">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Cart
              </span>
            </NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-xl border border-transparent hover:border-primary-500/20 dark:hover:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-navy-600 transition-all duration-300"
                aria-label="Toggle theme"
                id="theme-toggle"
              >
                {theme === "dark" ? (
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-navy-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {/* Auth Buttons */}
            {session ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-500/5 dark:bg-navy-600/50 hover:bg-primary-500/10 dark:hover:bg-navy-600/80 transition-all"
                >
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {session.user?.name || session.user?.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-danger-500/30 text-danger-500 hover:bg-danger-500/10 transition-all duration-300"
                  id="logout-button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-navy-600 transition-all duration-300"
                  id="login-link"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary !px-4 !py-2 text-sm"
                  id="register-link"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-navy-600 transition-all"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden animate-slide-down pb-4 border-t border-primary-100/10 dark:border-navy-500/30 mt-2">
            <div className="flex flex-col gap-1 pt-3">
              <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/products" onClick={() => setMobileOpen(false)}>Products</MobileNavLink>
              <MobileNavLink href="/cart" onClick={() => setMobileOpen(false)}>Cart</MobileNavLink>
              {isAdmin && (
                <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>Admin Dashboard</MobileNavLink>
              )}
              <div className="border-t border-primary-100/10 dark:border-navy-500/30 mt-2 pt-2">
                {session ? (
                  <>
                    <MobileNavLink href="/profile" onClick={() => setMobileOpen(false)}>
                      My Profile
                    </MobileNavLink>
                    <div className="px-4 py-2 text-sm text-navy-400 dark:text-navy-200">
                      Signed in as {session.user?.name || session.user?.email}
                    </div>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-500/10 rounded-xl transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/auth/login" onClick={() => setMobileOpen(false)}>Login</MobileNavLink>
                    <MobileNavLink href="/auth/register" onClick={() => setMobileOpen(false)}>Sign Up</MobileNavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-navy-600 transition-all duration-300 text-navy-600 dark:text-navy-200 hover:text-primary-500 dark:hover:text-primary-400"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-navy-600 transition-all"
    >
      {children}
    </Link>
  );
}
