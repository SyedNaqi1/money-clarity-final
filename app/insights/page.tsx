"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Tx = {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  category: string | null;
};

export default function InsightsPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [period, setPeriod] = useState("all");
  const [currency] = useState(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem(
            "moneyclarity_currency"
          ) || "PKR"
        : "PKR"
  );

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("transactions")
        .select("id,date,amount,type,category")
        .order("date", { ascending: true });

      setTransactions((data as Tx[]) || []);
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    if (period === "all") return transactions;

    const now = new Date();

    const days =
      period === "7"
        ? 7
        : period === "30"
        ? 30
        : period === "90"
        ? 90
        : 365;

    const start = new Date(now);
    start.setDate(start.getDate() - days);

    return transactions.filter(
      (t) => new Date(t.date) >= start
    );
  }, [transactions, period]);

  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const expenses = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const categories = useMemo(() => {
    const map: Record<string, number> = {};

    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const category =
          t.category || "Uncategorized";

        map[category] =
          (map[category] || 0) + Number(t.amount);
      });

    return Object.entries(map).sort(
      (a, b) => b[1] - a[1]
    );
  }, [filtered]);

  const max = Math.max(
    ...categories.map(([, value]) => value),
    1
  );

  return (
    <main className="dashboardPage">
      <div className="dashboardShell">
        <Sidebar />

        <div className="dashboardMain">
          <header className="dashHeader">
            <div>
              <div className="eyebrow">
                Financial intelligence
              </div>
              <strong>Insights</strong>
            </div>
          </header>

          <section className="dashContent">
            <div className="dashboardPageHeading">
              <div>
                <div className="eyebrow">
                  Analyze your business
                </div>
                <h1>Insights</h1>
                <p>
                  Understand where your money is coming
                  from and where it is going.
                </p>
              </div>

              <select
                className="periodSelect"
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value)
                }
              >
                <option value="all">All time</option>
                <option value="7">
                  Last 7 days
                </option>
                <option value="30">
                  Last 30 days
                </option>
                <option value="90">
                  Last 3 months
                </option>
                <option value="365">
                  Last year
                </option>
              </select>
            </div>

            <div className="statGrid big">
              <div className="stat">
                <span>Revenue</span>
                <strong>
                  {currency}{" "}
                  {income.toLocaleString()}
                </strong>
                <small>Selected period</small>
              </div>

              <div className="stat">
                <span>Expenses</span>
                <strong>
                  {currency}{" "}
                  {expenses.toLocaleString()}
                </strong>
                <small>Selected period</small>
              </div>

              <div className="stat">
                <span>Profit</span>
                <strong
                  className={
                    income - expenses < 0
                      ? "expense"
                      : ""
                  }
                >
                  {currency}{" "}
                  {(income - expenses).toLocaleString()}
                </strong>
                <small>Revenue minus expenses</small>
              </div>
            </div>

            <section className="panel">
              <div className="panelHead">
                <div>
                  <h2>Revenue vs expenses</h2>
                  <span>Period comparison</span>
                </div>
              </div>

              <div className="largeComparison">
                <div>
                  <span>Revenue</span>
                  <strong>
                    {currency}{" "}
                    {income.toLocaleString()}
                  </strong>

                  <div className="largeBarTrack">
                    <div
                      className="largeBar"
                      style={{
                        width: `${
                          (income /
                            Math.max(
                              income,
                              expenses,
                              1
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <span>Expenses</span>
                  <strong>
                    {currency}{" "}
                    {expenses.toLocaleString()}
                  </strong>

                  <div className="largeBarTrack">
                    <div
                      className="largeBar expenseLargeBar"
                      style={{
                        width: `${
                          (expenses /
                            Math.max(
                              income,
                              expenses,
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
                  <h2>Expense categories</h2>
                  <span>Spending breakdown</span>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="empty">
                  No expense data available.
                </div>
              ) : (
                <div className="categoryBars">
                  {categories.map(
                    ([category, amount]) => (
                      <div
                        className="categoryBarItem"
                        key={category}
                      >
                        <div className="categoryBarTop">
                          <span>{category}</span>
                          <strong>
                            {currency}{" "}
                            {amount.toLocaleString()}
                          </strong>
                        </div>

                        <div className="barTrack">
                          <div
                            className="bar categoryBar"
                            style={{
                              width: `${
                                (amount / max) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
