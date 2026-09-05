"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import type { AuthUser } from "@/types/admin";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(isLogin);
  useEffect(() => {
    if (isLogin) return;
    adminApi
      .me()
      .then((current) => {
        if (current.role !== "ADMIN") throw new Error("Forbidden");
        setUser(current);
        setReady(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [isLogin, router]);
  if (isLogin) return <>{children}</>;
  if (!ready)
    return (
      <div role="status" className="grid min-h-screen place-items-center bg-slate-50 px-5 text-center text-sm text-slate-500">
        Checking administrator session…
      </div>
    );
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white md:inset-y-0 md:right-auto md:w-60 md:flex-col md:border-r md:border-t-0">
        <Link
          href="/admin"
          className="hidden px-6 py-6 text-xl font-bold md:block"
        >
          Den<span className="text-blue-600">Tool</span>
        </Link>
        <nav className="flex flex-1 justify-around p-2 md:block md:space-y-1 md:px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`)) ? "page" : undefined}
              className={`block min-h-11 rounded-lg px-3 py-3 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 md:py-2 md:text-left ${pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`)) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button
          type="button"
          onClick={async () => {
            try {
              await adminApi.logout();
            } finally {
              router.replace("/admin/login");
            }
          }}
          variant="ghost"
          className="m-2 min-h-11 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700 md:text-left"
        >
          Logout
        </Button>
      </aside>
      <main className="pb-20 md:ml-60 md:pb-0">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <p className="font-semibold md:hidden">
            Den<span className="text-blue-600">Tool</span>
          </p>
          <span className="ml-auto text-sm text-slate-500">{user?.email}</span>
        </header>
        <div id="main-content" className="mx-auto max-w-7xl p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
