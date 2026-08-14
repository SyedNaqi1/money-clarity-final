"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type Tx = {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  category: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: today(),
  });

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

    const { data, error } = await supabase
      .from("transactions")
      .select("id,date,amount,type,description,category")
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
      .filter((x) => x.type === "income")
      .reduce((sum, x) => sum + Number(x.amount), 0);

    const expenses = transactions
      .filter((x) => x.type === "expense")
      .reduce((sum, x) => sum + Number(x.amount), 0);

    return {
      revenue,
      expenses,
      net: revenue - expenses,
    };
  }, [transactions]);

  async function addTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Enter a description.");
      return;
    }

    if (!form.date) {
      setMessage("Select a transaction date.");
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount,
      type: form.type,
      description: form.description.trim(),
      category: form.category.trim() || null,
      date: form.date,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setForm({
      type: "income",
      amount: "",
      description: "",
      category: "",
      date: today(),
    });

    setMessage("Transaction saved successfully.");

    await load();
  }

  async function deleteTransaction(id: string) {
    setMessage("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Transaction deleted.");

    await load();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="dashboardPage">
      <div className="dashboardShell">
        <Sidebar />

        <div className="dashboardMain">
          <header className="dashHeader">
            <div>
              <div className="eyebrow">Financial overview</div>
            </div>

            <div className="userArea">
              <span>{email}</span>

              <button type="button" onClick={logout}>
                Log out
              </button>
            </div>
          </header>

          <section className="dashContent">
            <div className="dashIntro">
              <div>
                <div className="eyebrow">Your finances</div>

                <h1>Your money, clearly.</h1>

                <p>
                  Track income and expenses and see your net position at a
                  glance.
                </p>
              </div>
            </div>

            <div className="statGrid big">
              <div className="stat">
                <span>Total revenue</span>

                <strong>
                  PKR {stats.revenue.toLocaleString()}
                </strong>

                <small>All recorded income</small>
              </div>

              <div className="stat">
                <span>Total expenses</span>

                <strong>
                  PKR {stats.expenses.toLocaleString()}
                </strong>

                <small>All recorded expenses</small>
              </div>

              <div className="stat">
                <span>Net</span>

                <strong>
                  PKR {stats.net.toLocaleString()}
                </strong>

                <small>
                  {stats.net >= 0
                    ? "Positive balance"
                    : "Needs attention"}
                </small>
              </div>
            </div>

            <div className="twoCol">
              <section className="panel">
                <div className="panelHead">
                  <h2>Add transaction</h2>
                </div>

                <form
                  onSubmit={addTransaction}
                  className="txForm"
                >
                  <div className="toggle">
                    <button
                      type="button"
                      className={
                        form.type === "income"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setForm({
                          ...form,
                          type: "income",
                        })
                      }
                    >
                      Income
                    </button>

                    <button
                      type="button"
                      className={
                        form.type === "expense"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setForm({
                          ...form,
                          type: "expense",
                        })
                      }
                    >
                      Expense
                    </button>
                  </div>

                  <label>
                    Amount (PKR)

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          amount: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </label>

                  <label>
                    Description

                    <input
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      placeholder="e.g. Client payment"
                    />
                  </label>

                  <label>
                    Category{" "}
                    <span className="optional">
                      optional
                    </span>

                    <input
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
                        })
                      }
                      placeholder="e.g. Sales, Rent"
                    />
                  </label>

                  <label>
                    Transaction date

                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          date: e.target.value,
                        })
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="button full"
                  >
                    Save transaction
                  </button>
                </form>

                {message && (
                  <div className="notice">
                    {message}
                  </div>
                )}
              </section>

              <section className="panel">
                <div className="panelHead">
                  <h2>Recent transactions</h2>

                  <span>
                    {transactions.length} total
                  </span>
                </div>

                {loading ? (
                  <p className="muted">
                    Loading…
                  </p>
                ) : transactions.length === 0 ? (
                  <div className="empty">
                    No transactions yet. Add your first
                    one.
                  </div>
                ) : (
                  <div className="txList">
                    {transactions
                      .slice(0, 10)
                      .map((t) => (
                        <div
                          className="txRow"
                          key={t.id}
                        >
                          <div>
                            <b>
                              {t.description}
                            </b>

                            <small>
                              {t.date}

                              {t.category
                                ? ` · ${t.category}`
                                : ""}
                            </small>
                          </div>

                          <div>
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
                              PKR{" "}
                              {Number(
                                t.amount
                              ).toLocaleString()}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                deleteTransaction(
                                  t.id
                                )
                              }
                              className="deleteButton"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
