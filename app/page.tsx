import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <nav className="nav">
        <div className="brand"><span className="brandMark">M</span> Money Clarity</div>
        <div className="navLinks">
          <Link href="/login">Log in</Link>
          <Link className="button small" href="/signup">Get started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow">Simple finances. Clear decisions.</div>
          <h1>Know where your money is going.</h1>
          <p>
            Money Clarity gives small businesses one simple place to record income,
            expenses, customers and suppliers — with a dashboard that makes the numbers easy to understand.
          </p>
          <div className="heroActions">
            <Link className="button" href="/signup">Create free account</Link>
            <Link className="button secondary" href="/login">I already have an account</Link>
          </div>
          <div className="trust">Free to start · Secure user-specific data · Built with Supabase</div>
        </div>

        <div className="mockDashboard">
          <div className="mockTop">
            <div><strong>Overview</strong><span> August 2026</span></div>
            <span className="pill">Healthy</span>
          </div>
          <div className="statGrid">
            <div className="stat"><span>Revenue</span><strong>PKR 425,000</strong><small>↑ 12.4%</small></div>
            <div className="stat"><span>Expenses</span><strong>PKR 178,500</strong><small>↓ 3.1%</small></div>
            <div className="stat"><span>Net</span><strong>PKR 246,500</strong><small>Positive</small></div>
          </div>
          <div className="chart">
            {[42,58,48,76,65,88,72,94,82,98].map((h, i) => <i key={i} style={{height:`${h}%`}} />)}
          </div>
          <div className="mockRows">
            <div><span>Sales · Customer payment</span><b>+ PKR 45,000</b></div>
            <div><span>Supplies · Office stock</span><b className="expense">− PKR 8,500</b></div>
            <div><span>Service · Client invoice</span><b>+ PKR 30,000</b></div>
          </div>
        </div>
      </section>

      <section className="features">
        <div><h3>Track everything</h3><p>Record income and expenses with categories, notes and payment details.</p></div>
        <div><h3>Stay organized</h3><p>Keep customers, suppliers and receipts connected to your financial records.</p></div>
        <div><h3>See the picture</h3><p>Revenue, expenses and net profit are calculated automatically.</p></div>
      </section>
    </main>
  );
}
