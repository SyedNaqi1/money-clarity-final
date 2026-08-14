"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(
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
        "moneyclarity_customers"
      );

    if (saved) {
      setCustomers(JSON.parse(saved));
    }
  }, []);

  function save(items: Customer[]) {
    setCustomers(items);

    localStorage.setItem(
      "moneyclarity_customers",
      JSON.stringify(items)
    );
  }

  function addCustomer(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!form.name.trim()) return;

    const customer: Customer = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
    };

    save([...customers, customer]);

    setForm({
      name: "",
      phone: "",
      email: "",
      notes: "",
    });
  }

  function removeCustomer(id: string) {
    if (!window.confirm("Remove this customer?")) {
      return;
    }

    save(
      customers.filter(
        (customer) => customer.id !== id
      )
    );
  }

  return (
    <main className="dashboardPage">
      <div className="dashboardShell">
        <Sidebar />

        <div className="dashboardMain">
          <header className="dashHeader">
            <strong>Customers</strong>
          </header>

          <section className="dashContent">
            <div className="dashboardPageHeading">
              <div>
                <div className="eyebrow">
                  Relationships
                </div>
                <h1>Customers</h1>
                <p>
                  Keep frequently used customer details
                  ready for future transactions.
                </p>
              </div>
            </div>

            <div className="twoCol">
              <section className="panel">
                <div className="panelHead">
                  <h2>Add customer</h2>
                </div>

                <form
                  className="txForm"
                  onSubmit={addCustomer}
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
                      placeholder="Customer name"
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
                    Save customer
                  </button>
                </form>
              </section>

              <section className="panel">
                <div className="panelHead">
                  <h2>Saved customers</h2>
                  <span>
                    {customers.length}
                  </span>
                </div>

                {customers.length === 0 ? (
                  <div className="empty">
                    No customers added yet.
                  </div>
                ) : (
                  <div className="peopleList">
                    {customers.map((customer) => (
                      <div
                        className="personCard"
                        key={customer.id}
                      >
                        <div>
                          <strong>
                            {customer.name}
                          </strong>

                          {customer.phone && (
                            <small>
                              {customer.phone}
                            </small>
                          )}

                          {customer.email && (
                            <small>
                              {customer.email}
                            </small>
                          )}

                          {customer.notes && (
                            <p>
                              {customer.notes}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() =>
                            removeCustomer(customer.id)
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
