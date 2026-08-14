"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const [company, setCompany] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCompany =
      localStorage.getItem(
        "moneyclarity_company"
      ) || "";

    const savedCurrency =
      localStorage.getItem(
        "moneyclarity_currency"
      ) || "PKR";

    setCompany(savedCompany);
    setCurrency(savedCurrency);

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email || "");
    }

    loadUser();
  }, []);

  function saveSettings(
    e: React.FormEvent
  ) {
    e.preventDefault();

    localStorage.setItem(
      "moneyclarity_company",
      company.trim() || "Your business"
    );

    localStorage.setItem(
      "moneyclarity_currency",
      currency
    );

    setMessage("Settings saved successfully.");
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
            <strong>Settings</strong>
          </header>

          <section className="dashContent">
            <div className="dashboardPageHeading">
              <div>
                <div className="eyebrow">
                  Personalization
                </div>
                <h1>Settings</h1>
                <p>
                  Customize Money Clarity for your
                  business.
                </p>
              </div>
            </div>

            <div className="settingsGrid">
              <section className="panel">
                <div className="panelHead">
                  <h2>Business settings</h2>
                </div>

                <form
                  className="txForm"
                  onSubmit={saveSettings}
                >
                  <label>
                    Company / business name
                    <input
                      value={company}
                      onChange={(e) =>
                        setCompany(e.target.value)
                      }
                      placeholder="Your business"
                    />
                  </label>

                  <label>
                    Currency
                    <select
                      value={currency}
                      onChange={(e) =>
                        setCurrency(e.target.value)
                      }
                    >
                      <option value="PKR">
                        PKR — Pakistani Rupee
                      </option>

                      <option value="USD">
                        USD — US Dollar
                      </option>

                      <option value="GBP">
                        GBP — British Pound
                      </option>

                      <option value="EUR">
                        EUR — Euro
                      </option>

                      <option value="AED">
                        AED — UAE Dirham
                      </option>

                      <option value="SAR">
                        SAR — Saudi Riyal
                      </option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="button full"
                  >
                    Save settings
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
                  <h2>Account</h2>
                </div>

                <div className="accountInfo">
                  <span>Email address</span>
                  <strong>{email}</strong>
                </div>

                <button
                  type="button"
                  className="button secondary full"
                  onClick={logout}
                >
                  Log out
                </button>
              </section>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
