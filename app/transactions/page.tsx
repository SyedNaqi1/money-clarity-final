```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  category: string | null;
  party: string | null;
  payment_method: string | null;
  receipt_url: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [filter, setFilter] = useState<
    "all" | "income" | "expense"
  >("all");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    party: "",
    payment_method: "",
    date: today(),
  });

  async function loadTransactions() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id,date,amount,type,description,category,party,payment_method,receipt_url"
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setTransactions([]);
    } else {
      setTransactions((data as Transaction[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const categories = useMemo(() => {
    const values = transactions
      .map((transaction) => transaction.category)
      .filter(
        (category): category is string =>
          Boolean(category && category.trim())
      );

    return Array.from(new Set(values)).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const typeMatches =
        filter === "all" || transaction.type === filter;

      const categoryMatches =
        categoryFilter === "all" ||
        transaction.category === categoryFilter;

      return typeMatches && categoryMatches;
    });
  }, [transactions, filter, categoryFilter]);

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
        party: form.party.trim() || null,
        payment_method:
          form.payment_method.trim() || null,
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
      party: "",
      payment_method: "",
      date: today(),
    });

    setMessage("Transaction saved successfully.");

    await loadTransactions();
  }

  async function deleteTransaction(id: string) {
    setMessage("");

    const confirmed = window.confirm(
      "Delete this transaction?"
    );

    if (!confirmed) return;

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
                Financial records
              </div>

              <h1 className="pageHeading">
                Transactions
              </h1>
            </div>

            <button
              type="button"
              className="logoutButton"
              onClick={logout}
            >
              Log out
            </button>
          </header>

          <section className="dashContent">
            <div className="pageIntro">
              <div>
                <div className="eyebrow">
                  All activity
                </div>

                <h2>
                  Every payment in one place.
                </h2>

                <p>
                  Record, review and filter your
                  income and expenses.
                </p>
              </div>
            </div>

            <div className="transactionLayout">
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
                    Amount
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          amount:
                            event.target.value,
                        })
                      }
                      placeholder="0.00"
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
                    Category
                    <input
                      value={form.category}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          category:
                            event.target.value,
                        })
                      }
                      placeholder="e.g. Sales, Fuel, Rent"
                    />
                  </label>

                  <label>
                    Customer / Supplier
                    <input
                      value={form.party}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          party:
                            event.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </label>

                  <label>
                    Payment method
                    <select
                      value={form.payment_method}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          payment_method:
                            event.target.value,
                        })
                      }
                    >
                      <option value="">
                        Select method
                      </option>
                      <option value="Cash">
                        Cash
                      </option>
                      <option value="Bank">
                        Bank
                      </option>
                      <option value="Card">
                        Card
                      </option>
                      <option value="Online">
                        Online
                      </option>
                    </select>
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

              <section className="panel">
                <div className="panelHead">
                  <div>
                    <h2>Transactions</h2>
                    <span>
                      {filteredTransactions.length} shown
                    </span>
                  </div>
                </div>

                <div className="transactionFilters">
                  <button
                    type="button"
                    className={
                      filter === "all"
                        ? "filterButton active"
                        : "filterButton"
                    }
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>

                  <button
                    type="button"
                    className={
                      filter === "income"
                        ? "filterButton active"
                        : "filterButton"
                    }
                    onClick={() =>
                      setFilter("income")
                    }
                  >
                    Income
                  </button>

                  <button
                    type="button"
                    className={
                      filter === "expense"
                        ? "filterButton active"
                        : "filterButton"
                    }
                    onClick={() =>
                      setFilter("expense")
                    }
                  >
                    Expenses
                  </button>

                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(
                        event.target.value
                      )
                    }
                  >
                    <option value="all">
                      All categories
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {loading ? (
                  <p className="muted">
                    Loading transactions…
                  </p>
                ) : filteredTransactions.length ===
                  0 ? (
                  <div className="empty">
                    No transactions match
                    your filters.
                  </div>
                ) : (
                  <div className="txList">
                    {filteredTransactions.map(
                      (transaction) => (
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

                              {transaction.party
                                ? ` · ${transaction.party}`
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
                      )
                    )}
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
```
