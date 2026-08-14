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
  receipt_url: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: today(),
    notes: "",
    receipt: null as File | null,
  });

  const [currency] = useState(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem(
            "moneyclarity_currency"
          ) || "PKR"
        : "PKR"
  );

  async function load() {
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
        "id,date,amount,type,description,category,receipt_url"
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setTransactions((data as Tx[]) || []);
    }

    const savedCategories =
      localStorage.getItem(
        "moneyclarity_categories"
      );

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const categoryMatch =
        filter === "all" ||
        (t.category || "Uncategorized") === filter;

      const typeMatch =
        typeFilter === "all" || t.type === typeFilter;

      return categoryMatch && typeMatch;
    });
  }, [transactions, filter, typeFilter]);

  async function addTransaction(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Enter a description.");
      return;
    }

    let receiptUrl: string | null = null;

    if (form.receipt) {
      const extension =
        form.receipt.name.split(".").pop() || "file";

      const fileName = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("receipts")
          .upload(fileName, form.receipt);

      if (uploadError) {
        setMessage(
          "Receipt could not be uploaded. Make sure the Supabase Storage bucket 'receipts' exists."
        );
        return;
      }

      const { data } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      receiptUrl = data.publicUrl;
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
        notes: form.notes.trim() || null,
        receipt_url: receiptUrl,
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
      notes: "",
      receipt: null,
    });

    setMessage("Transaction saved.");

    await load();
  }

  async function deleteTransaction(id: string) {
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
    await load();
  }

  return (
    <main className="dashboardPage">
      <div className="dashboardShell">
        <Sidebar />

        <div className="dashboardMain">
          <header className="dashHeader">
            <div>
              <div className="eyebrow">Money Clarity</div>
              <strong>Transactions</strong>
            </div>
          </header>

          <section className="dashContent">
            <div className="dashboardPageHeading">
              <div>
                <div className="eyebrow">
                  Financial records
                </div>
                <h1>Transactions</h1>
                <p>
                  Record, review and manage every income
                  and expense.
                </p>
              </div>
            </div>

            {message && (
              <div className="notice">{message}</div>
            )}

            <div className="transactionLayout">
              <section className="panel">
                <div className="panelHead">
                  <h2>Add transaction</h2>
                </div>

                <form
                  className="txForm"
                  onSubmit={addTransaction}
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
                    Amount ({currency})
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
                    Category
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Uncategorized
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
                  </label>

                  <label>
                    Date
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

                  <label>
                    Notes
                    <textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Optional notes"
                    />
                  </label>

                  <label>
                    Receipt
                    <span className="optional">
                      optional
                    </span>

                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          receipt:
                            e.target.files?.[0] || null,
                        })
                      }
                    />

                    <small className="muted">
                      Add a photo or PDF receipt if you
                      want to document this transaction.
                    </small>
                  </label>

                  <button
                    type="submit"
                    className="button full"
                  >
                    Save transaction
                  </button>
                </form>
              </section>

              <section className="panel">
                <div className="panelHead">
                  <div>
                    <h2>All transactions</h2>
                    <span>
                      {filtered.length} records
                    </span>
                  </div>
                </div>

                <div className="filterBar">
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value)
                    }
                  >
                    <option value="all">
                      All types
                    </option>
                    <option value="income">
                      Income
                    </option>
                    <option value="expense">
                      Expenses
                    </option>
                  </select>

                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value)
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

                    <option value="Uncategorized">
                      Uncategorized
                    </option>
                  </select>
                </div>

                {loading ? (
                  <p className="muted">Loading…</p>
                ) : filtered.length === 0 ? (
                  <div className="empty">
                    No transactions match your filters.
                  </div>
                ) : (
                  <div className="txList">
                    {filtered.map((t) => {
                      const needsReview =
                        t.type === "expense" &&
                        Number(t.amount) > 500 &&
                        !t.receipt_url;

                      return (
                        <div
                          className="txRow transactionRow"
                          key={t.id}
                        >
                          <div>
                            <b>{t.description}</b>

                            <small>
                              {t.date}
                              {" · "}
                              {t.category ||
                                "Uncategorized"}
                            </small>

                            {needsReview && (
                              <span className="reviewBadge">
                                Review needed
                              </span>
                            )}

                            {t.receipt_url && (
                              <span className="receiptBadge">
                                Receipt attached
                              </span>
                            )}
                          </div>

                          <div className="txActions">
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
                              {currency}{" "}
                              {Number(
                                t.amount
                              ).toLocaleString()}
                            </strong>

                            <button
                              type="button"
                              className="deleteButton"
                              onClick={() =>
                                deleteTransaction(t.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
