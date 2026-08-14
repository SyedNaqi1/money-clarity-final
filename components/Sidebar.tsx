"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/transactions", label: "Transactions", icon: "↕" },
  { href: "/insights", label: "Insights", icon: "◔" },
  { href: "/customers", label: "Customers", icon: "♙" },
  { href: "/suppliers", label: "Suppliers", icon: "⌂" },
  { href: "/categories", label: "Categories", icon: "◫" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebarTop">
        <Link href="/dashboard" className="sidebarBrand">
          <span className="brandMark">M</span>
          <span>Money Clarity</span>
        </Link>
      </div>

      <nav className="sidebarNav">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebarLink ${active ? "active" : ""}`}
            >
              <span className="sidebarIcon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebarBottom">
        <Link
          href="/settings"
          className={`sidebarLink ${
            pathname === "/settings" ? "active" : ""
          }`}
        >
          <span className="sidebarIcon">⚙</span>
          <span>Settings</span>
        </Link>

        <Link href="/" className="sidebarLink">
          <span className="sidebarIcon">←</span>
          <span>Home</span>
        </Link>
      </div>
    </aside>
  );
}
