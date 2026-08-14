"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebarTop">
        <Link href="/" className="sidebarBrand">
          <span className="brandMark">M</span>
          Money Clarity
        </Link>

        <Link href="/dashboard" className="sidebarAdd">
          <span>+</span>
          Add transaction
        </Link>

        <nav className="sidebarNav">
          <div className="sidebarLabel">Overview</div>

          <Link
            href="/dashboard"
            className="sidebarLink active"
          >
            <span className="sidebarIcon">⌂</span>
            Dashboard
          </Link>

          <Link
            href="/transactions"
            className="sidebarLink"
          >
            <span className="sidebarIcon">↕</span>
            Transactions
          </Link>

          <div className="sidebarLabel">Insights</div>

          <Link
            href="/insights"
            className="sidebarLink"
          >
            <span className="sidebarIcon">◔</span>
            Insights
          </Link>

          <Link
            href="/customers"
            className="sidebarLink"
          >
            <span className="sidebarIcon">♙</span>
            Customers
          </Link>

          <Link
            href="/suppliers"
            className="sidebarLink"
          >
            <span className="sidebarIcon">▣</span>
            Suppliers
          </Link>

          <div className="sidebarLabel">Manage</div>

          <Link
            href="/reports"
            className="sidebarLink"
          >
            <span className="sidebarIcon">▤</span>
            Reports
          </Link>

          <Link
            href="/settings"
            className="sidebarLink"
          >
            <span className="sidebarIcon">⚙</span>
            Settings
          </Link>
        </nav>
      </div>

      <div className="sidebarBottom">
        <div className="sidebarHelp">
          <div className="helpIcon">?</div>

          <div>
            <strong>Need help?</strong>
            <small>
              Manage your finances with clarity.
            </small>
          </div>
        </div>
      </div>
    </aside>
  );
}
