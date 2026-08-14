"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebarTop">
        <Link href="/" className="sidebarBrand">
          <span className="brandMark">M</span>
          <span>Money Clarity</span>
        </Link>
      </div>

      <nav className="sidebarNav">

        <Link
          href="/dashboard"
          className={`sidebarLink ${
            pathname === "/dashboard" ? "active" : ""
          }`}
        >
          <span className="sidebarIcon">▦</span>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard#transactions"
          className="sidebarLink"
        >
          <span className="sidebarIcon">↕</span>
          <span>Transactions</span>
        </Link>

        <Link
          href="/dashboard#insights"
          className="sidebarLink"
        >
          <span className="sidebarIcon">◔</span>
          <span>Insights</span>
        </Link>

        <Link
          href="/dashboard#customers"
          className="sidebarLink"
        >
          <span className="sidebarIcon">♙</span>
          <span>Customers</span>
        </Link>

        <Link
          href="/dashboard#suppliers"
          className="sidebarLink"
        >
          <span className="sidebarIcon">⌂</span>
          <span>Suppliers</span>
        </Link>

      </nav>

      <div className="sidebarBottom">
        <Link href="/" className="sidebarLink">
          <span className="sidebarIcon">←</span>
          <span>Home</span>
        </Link>
      </div>
    </aside>
  );
}
