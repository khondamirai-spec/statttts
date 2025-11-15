"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Viloyatlar", href: "/#regions", hash: "#regions" },
  { label: "Kurslar", href: "/#courses", hash: "#courses" },
  { label: "Statistikalar", href: "/#statistics", hash: "#statistics" },
];

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState<string>("");
  const isDashboard = pathname === "/";

  useEffect(() => {
    if (isDashboard) {
      setActiveHash(window.location.hash || "");
    }
  }, [isDashboard]);

  useEffect(() => {
    if (!isDashboard) return;
    const sectionIds = ["regions", "courses", "statistics"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const nextHash = `#${visible.target.id}`;
          setActiveHash(nextHash);
          window.history.replaceState(null, "", nextHash);
        } else if (window.scrollY < 200) {
          setActiveHash("");
          window.history.replaceState(null, "", "/");
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-20% 0px -55% 0px",
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isDashboard]);

  const handleClick = (link: (typeof navLinks)[number]) => {
    if (link.href === "/") {
      router.push("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveHash("");
      window.history.replaceState(null, "", "/");
      return;
    }

    if (link.hash && isDashboard) {
      const target = document.querySelector(link.hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveHash(link.hash);
        window.history.replaceState(null, "", link.hash);
      }
    } else {
      router.push(link.href);
    }
  };

  const activeHref = useMemo(() => {
    if (!isDashboard) return pathname;
    return activeHash || "/";
  }, [activeHash, isDashboard, pathname]);

  return (
    <header className="app-nav">
      <div className="app-nav__brand">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icon/icon.png"
            alt="Af Ustoz AI logo"
            width={36}
            height={36}
            className="rounded-xl"
            priority
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              AF Ustoz
            </p>
            <p className="text-lg font-black text-slate-900">AI Dashboard</p>
          </div>
        </Link>
      </div>
      <nav className="app-nav__links">
        {navLinks.map((link) => (
          <button
            key={link.href}
            type="button"
            className={cn(
              "app-nav__link",
              activeHref === link.href ||
                (link.hash && activeHref === link.hash)
                ? "app-nav__link--active"
                : "",
            )}
            onClick={() => handleClick(link)}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="app-nav__actions">
      </div>
    </header>
  );
}

