"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Tx = {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  category: string | null;
  receipt_url?: string | null;
};

function money(amount: number, currency = "PKR") {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [companyName, setCompanyName] = useState("Your business");
  const [message, setMessage] = useState("");

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setEmail(user.email || "");

    const savedCurrency =
      localStorage.getItem("moneyclarity_currency") || "PKR";

    const savedCompany =
      localStorage.getItem("moneyclarity_company") ||
      "Your business";

    setCurrency(savedCurrency);
    setCompanyName(savedCompany);

    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id,date,amount,type,description,category,receipt_url"
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setTransactions([]);
    } else {
      setTransactions((data as Tx[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      revenue,
      expenses,
      net: revenue - expenses,
    };
  }, [transactions]);

  const reviewTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.type === "expense" &&
        Number(t.amount) > 500 &&
        !t.receipt_url
    );
  }, [transactions]);

  const categories = useMemo(() => {
    const map: Record<string, number> = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const name = t.category?.trim() || "Uncategorized";

        map[name] = (map[name] || 0) + Number(t.amount);
      });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [transactions]);

  const maxCategory = Math.max(
    ...categories.map(([, value]) => value),
    1
  );

  if (loading) {
    return (
      <main className="dashboardPage">
        <div className="dashboardShell">
          <Sidebar />
          <div className="dashboardMain">
            <div className="loadingPage">Loading your dashboard…</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboardPage">
      <div className="dashboardShell">
        <Sidebar />

        <div className="dashboardMain">
          <header className="dashHeader">
            <div>
              <div className="eyebrow">Financial overview</div>
              <strong>{companyName}</strong>
            </div>

            <div className="userArea">
              <span>{email}</span>
            </div>
          </header>

          <section className="dashContent">
            <div className="dashboardPageHeading">
              <div>
                <div className="eyebrow">Dashboard</div>
                <h1>Your money, clearly.</h1>
                <p>
                  A complete overview of your income, expenses and
                  financial position.
                </p>
              </div>

              <Link href="/transactions" className="button">
                + Add transaction
              </Link>
            </div>

            {message && (
              <div className="notice">{message}</div>
            )}

            <div className="statGrid big">
              <div className="stat">
                <span>Revenue</span>
                <strong>{money(stats.revenue, currency)}</strong>
                <small>Total recorded income</small>
              </div>

              <div className="stat">
                <span>Expenses</span>
                <strong>
                  {money(stats.expenses, currency)}
                </strong>
                <small>Total recorded expenses</small>
              </div>

              <div className="stat">
                <span>Net profit</span>
                <strong
                  className={
                    stats.net < 0 ? "expense" : ""
                  }
                >
                  {money(stats.net, currency)}
                </strong>
                <small>
                  {stats.net >= 0
                    ? "Positive position"
                    : "Needs attention"}
                </small>
              </div>
            </div>

            <div className="dashboardGrid">
              <section className="panel">
                <div className="panelHead">
                  <div>
                    <h2>Revenue vs expenses</h2>
                    <span>All recorded transactions</span>
                  </div>
                </div>

                <div className="comparisonChart">
                  <div className="comparisonItem">
                    <div className="comparisonLabel">
                      <span>Revenue</span>
                      <strong>
                        {money(stats.revenue, currency)}
                      </strong>
                    </div>

                    <div className="barTrack">
                      <div
                        className="bar incomeBar"
                        style={{
                          width: `${
                            Math.max(
                              stats.revenue,
                              stats.expenses,
                              1
                            ) === 0
                              ? 0
                              : (stats.revenue /
                                  Math.max(
                                    stats.revenue,
                                    stats.expenses,
                                    1
                                  )) *
                                100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="comparisonItem">
                    <div className="comparisonLabel">
                      <span>Expenses</span>
                      <strong>
                        {money(stats.expenses, currency)}
                      </strong>
                    </div>

                    <div className="barTrack">
                      <div
                        className="bar expenseBar"
                        style={{
                          width: `${
                            (stats.expenses /
                              Math.max(
                                stats.revenue,
                                stats.expenses,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="panelHead">
                  <div>
                    <h2>Where the money went</h2>
                    <span>Top expense categories</span>
                  </div>

                  <Link href="/insights">
                    View insights
                  </Link>
                </div>

                {categories.length === 0 ? (
                  <div className="empty">
                    No expenses recorded yet.
                  </div>
                ) : (
                  <div className="categoryBars">
                    {categories.map(([category, amount]) => (
                      <div
                        className="categoryBarItem"
                        key={category}
                      >
                        <div className="categoryBarTop">
                          <span>{category}</span>
                          <strong>
                            {money(amount, currency)}
                          </strong>
                        </div>

                        <div className="barTrack">
                          <div
                            className="bar categoryBar"
                            style={{
                              width: `${
                                (amount / maxCategory) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="panel reviewPanel">
              <div className="panelHead">
                <div>
                  <h2>Action needed</h2>
                  <span>
                    Expenses above {currency} 500 without a receipt
                  </span>
                </div>

                {reviewTransactions.length > 0 && (
                  <span className="reviewCount">
                    {reviewTransactions.length} review
                    {reviewTransactions.length === 1
                      ? ""
                      : "s"}
                  </span>
                )}
              </div>

              {reviewTransactions.length === 0 ? (
                <div className="reviewGood">
                  <span>✓</span>
                  <div>
                    <strong>Everything looks good.</strong>
                    <p>
                      No transactions currently need review.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="reviewList">
                  {reviewTransactions
                    .slice(0, 5)
                    .map((transaction) => (
                      <div
                        className="reviewRow"
                        key={transaction.id}
                      >
                        <div>
                          <strong>
                            {transaction.description}
                          </strong>
                          <small>
                            {transaction.date} · Missing receipt
                          </small>
                        </div>

                        <strong>
                          {money(
                            Number(transaction.amount),
                            currency
                          )}
                        </strong>
                      </div>
                    ))}

                  <Link
                    href="/transactions"
                    className="reviewLink"
                  >
                    Review transactions →
                  </Link>
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panelHead">
                <div>
                  <h2>Recent transactions</h2>
                  <span>
                    {transactions.length} total
                  </span>
                </div>

                <Link href="/transactions">
                  View all
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="empty">
                  No transactions yet.
                </div>
              ) : (
                <div className="txList">
                  {transactions.slice(0, 8).map((t) => (
                    <div className="txRow" key={t.id}>
                      <div>
                        <b>{t.description}</b>
                        <small>
                          {t.date}
                          {t.category
                            ? ` · ${t.category}`
                            : ""}
                        </small>
                      </div>

                      <strong
                        className={
                          t.type === "expense"
                            ? "expense"
                            : ""
                        }
                      >
                        {t.type === "expense"
                          ? "−"
                          : "+"}{" "}
                        {money(
                          Number(t.amount),
                          currency
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
