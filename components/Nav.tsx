"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/", label: "学习首页" },
  { href: "/studio", label: "训练中心" },
  { href: "/progress", label: "学习进度" },
  { href: "/vocabulary", label: "词汇与记录" },
];

export default function Nav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {links.map((l) => {
        const active =
          l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-lg text-[0.81rem] transition-colors ${
              active
                ? "bg-sage-soft text-sage-deep font-medium"
                : "text-ink-soft hover:text-ink hover:bg-parchment"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      {user ? (
        <div className="flex items-center gap-2 ml-1 pl-2 border-l border-line">
          <span className="text-[0.78rem] text-ink-soft max-w-[9rem] truncate">
            {user.email?.split("@")[0]}
          </span>
          <button
            onClick={() => signOut()}
            className="px-2.5 py-1.5 rounded-lg text-[0.78rem] text-ink-soft hover:text-clay-deep hover:bg-clay-soft transition-colors"
          >
            退出
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="ml-1 px-3 py-1.5 rounded-lg bg-sage text-cream text-[0.81rem] font-medium hover:bg-sage-deep transition-colors"
        >
          登录
        </Link>
      )}
    </nav>
  );
}
