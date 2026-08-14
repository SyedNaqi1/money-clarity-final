"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(
    []
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "moneyclarity_suppliers"
      );

    if (saved) {
      setSuppliers(JSON.parse(saved));
    }
  }, []);

  function save(items: Supplier[]) {
    setSuppliers(items);

    localStorage.setItem(
      "moneyclarity_suppliers",
      JSON.stringify(items)
    );
  }

  function addSupplier(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!form.name.trim()) return;

    const supplier: Supplier = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
    };

    save([...suppliers, supplier]);

    setForm({
      name: "",
      phone: "",
      email: "",
      notes: "",
    });
  }

  function removeSupplier(id: string) {
    if (!window.confirm("Remove this supplier?")) {
      return;
    }

    save(
      suppliers.filter(
        (supplier) => supplier.id !== id
      )
    );
  }

  return (
    <main className="dashboardPage">
      <div className="dashboardShell">
        <Sidebar />

        <div className="dashboardMain">
          <header className="dashHeader">
            <strong>Suppliers</strong>
          </header>

          <section className="dashContent">
            <div className="dashboardPageHeading">
              <div>
                <div className="eyebrow">
                  Business relationships
                </div>
                <h1>Suppliers</h1>
                <p>
                  Store supplier information for quick
                  access when recording expenses.
                </p>
              </div>
            </div>

            <div className="twoCol">
              <section className="panel">
                <div className="panelHead">
                  <h2>Add supplier</h2>
                </div>

                <form
                  className="txForm"
                  onSubmit={addSupplier}
                >
                  <label>
                    Name
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      placeholder="Supplier name"
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Phone number"
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      placeholder="Email address"
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

                  <button
                    type="submit"
                    className="button full"
                  >
                    Save supplier
                  </button>
                </form>
              </section>

              <section className="panel">
                <div className="panelHead">
                  <h2>Saved suppliers</h2>
                  <span>
                    {suppliers.length}
                  </span>
                </div>

                {suppliers.length === 0 ? (
                  <div className="empty">
                    No suppliers added yet.
                  </div>
                ) : (
                  <div className="peopleList">
                    {suppliers.map((supplier) => (
                      <div
                        className="personCard"
                        key={supplier.id}
                      >
                        <div>
                          <strong>
                            {supplier.name}
                          </strong>

                          {supplier.phone && (
                            <small>
                              {supplier.phone}
                            </small>
                          )}

                          {supplier.email && (
                            <small>
                              {supplier.email}
                            </small>
                          )}

                          {supplier.notes && (
                            <p>
                              {supplier.notes}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() =>
                            removeSupplier(supplier.id)
                          }
                        >
                          Remove
                        </button>
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
