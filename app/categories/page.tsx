"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "moneyclarity_categories"
      );

    if (saved) {
      setCategories(JSON.parse(saved));
    }
  }, []);

  function save(items: string[]) {
    setCategories(items);

    localStorage.setItem(
      "moneyclarity_categories",
      JSON.stringify(items)
    );
  }

  function addCategory(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const clean = name.trim();

    if (!clean) return;

    if (
      categories.some(
        (category) =>
          category.toLowerCase() ===
          clean.toLowerCase()
      )
    ) {
      setMessage("This category already exists.");
      return;
    }

    save([...categories, clean]);
    setName("");
    setMessage("Category added.");
  }

  function removeCategory(category: string) {
    if (
      !window.confirm(
        `Remove "${category}" from your categories?`
      )
    ) {
      return;
    }

    save(
      categories.filter(
        (item) => item !== category
      )
    );
  }

  return (
    <main className="dashboardPage">
      <div className="dashboardShell">
        <Sidebar />

        <div className="dashboardMain">
          <header className="dashHeader">
            <strong>Categories</strong>
          </header>

          <section className="dashContent">
            <div className="dashboardPageHeading">
              <div>
                <div className="eyebrow">
                  Organization
                </div>
                <h1>Categories</h1>
                <p>
                  Create categories that match the way
                  your business operates.
                </p>
              </div>
            </div>

            <div className="twoCol">
              <section className="panel">
                <div className="panelHead">
                  <h2>New category</h2>
                </div>

                <form
                  className="txForm"
                  onSubmit={addCategory}
                >
                  <label>
                    Category name
                    <input
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="e.g. Fuel"
                    />
                  </label>

                  <button
                    type="submit"
                    className="button full"
                  >
                    Add category
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
                  <h2>Your categories</h2>
                  <span>
                    {categories.length}
                  </span>
                </div>

                {categories.length === 0 ? (
                  <div className="empty">
                    No categories created yet.
                  </div>
                ) : (
                  <div className="categoryList">
                    {categories.map((category) => (
                      <div
                        className="categoryListItem"
                        key={category}
                      >
                        <strong>{category}</strong>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() =>
                            removeCategory(category)
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
