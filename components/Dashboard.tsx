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
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: today(),
  });

  async function loadTransactions() {
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
    loadTransactions();
  }, []);

  const stats = useMemo(() => {
    const revenue = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

    return {
      revenue,
      expenses,
      net: revenue - expenses,
    };
  }, [transactions]);

  const expenseCategories = useMemo(() => {
    const categories: Record<string, number> = {};

    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const category =
          transaction.category?.trim() || "Uncategorized";

        categories[category] =
          (categories[category] || 0) +
          Number(transaction.amount);
      });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [transactions]);

  async function addTransaction(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
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

    const { error } = await supabase
      .from("transactions")
      .insert({
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

    await loadTransactions();
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

    await loadTransactions();
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
              <div className="eyebrow">
                Financial overview
              </div>
            </div>

            <div className="userArea">
              <span>{email}</span>

              <button
                type="button"
                onClick={logout}
              >
                Log out
              </button>
            </div>
          </header>

          <section className="dashContent">

            <div className="dashIntro">
              <div>
                <div className="eyebrow">
                  Your finances
                </div>

                <h1>
                  Your money, clearly.
                </h1>

                <p>
                  Track income and expenses and see
                  your net position at a glance.
                </p>
              </div>
            </div>

            <div className="statGrid big">

              <div className="stat">
                <span>Total revenue</span>

                <strong>
                  PKR {stats.revenue.toLocaleString()}
                </strong>

                <small>
                  All recorded income
                </small>
              </div>

              <div className="stat">
                <span>Total expenses</span>

                <strong>
                  PKR {stats.expenses.toLocaleString()}
                </strong>

                <small>
                  All recorded expenses
                </small>
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
                      onChange={(event) =>
                        setForm({
                          ...form,
                          amount: event.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </label>

                  <label>
                    Description

                    <input
                      value={form.description}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          description:
                            event.target.value,
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
                      onChange={(event) =>
                        setForm({
                          ...form,
                          category:
                            event.target.value,
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
                      onChange={(event) =>
                        setForm({
                          ...form,
                          date: event.target.value,
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

              <section
                className="panel"
                id="transactions"
              >

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
                    No transactions yet.
                    Add your first one.
                  </div>

                ) : (

                  <div className="txList">

                    {transactions
                      .slice(0, 10)
                      .map((transaction) => (

                        <div
                          className="txRow"
                          key={transaction.id}
                        >

                          <div>
                            <b>
                              {transaction.description}
                            </b>

                            <small>
                              {transaction.date}

                              {transaction.category
                                ? ` · ${transaction.category}`
                                : ""}
                            </small>
                          </div>

                          <div className="txActions">

                            <strong
                              className={
                                transaction.type ===
                                "expense"
                                  ? "expense"
                                  : ""
                              }
                            >
                              {transaction.type ===
                              "expense"
                                ? "−"
                                : "+"}{" "}
                              PKR{" "}
                              {Number(
                                transaction.amount
                              ).toLocaleString()}
                            </strong>

                            <button
                              type="button"
                              className="deleteButton"
                              onClick={() =>
                                deleteTransaction(
                                  transaction.id
                                )
                              }
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

            <section
              className="summarySection"
              id="insights"
            >

              <div className="sectionTitle">
                <div>
                  <div className="eyebrow">
                    Financial insights
                  </div>

                  <h2>
                    Where your money is going
                  </h2>
                </div>
              </div>

              {expenseCategories.length === 0 ? (

                <div className="summaryCard">
                  <p className="muted">
                    Add some expenses to see
                    spending insights here.
                  </p>
                </div>

              ) : (

                <div className="categoryGrid">

                  {expenseCategories.map(
                    ([category, amount]) => (
                      <div
                        className="summaryCard"
                        key={category}
                      >
                        <span>
                          {category}
                        </span>

                        <strong>
                          PKR{" "}
                          {amount.toLocaleString()}
                        </strong>
                      </div>
                    )
                  )}

                </div>

              )}

            </section>

            <section
              className="summarySection"
              id="customers"
            >

              <div className="sectionTitle">
                <div>
                  <div className="eyebrow">
                    Customers
                  </div>

                  <h2>
                    Customer overview
                  </h2>
                </div>
              </div>

              <div className="summaryCard">
                <strong>
                  Customer management
                </strong>

                <p className="muted">
                  Customer tracking can be
                  connected to your income
                  transactions here.
                </p>
              </div>

            </section>

            <section
              className="summarySection"
              id="suppliers"
            >

              <div className="sectionTitle">
                <div>
                  <div className="eyebrow">
                    Suppliers
                  </div>

                  <h2>
                    Supplier overview
                  </h2>
                </div>
              </div>

              <div className="summaryCard">
                <strong>
                  Supplier management
                </strong>

                <p className="muted">
                  Supplier and purchase
                  tracking can be managed
                  from this section.
                </p>
              </div>

            </section>

          </section>

        </div>

      </div>

    </main>
  );
}
