 "use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) setMessage(error.message);
      else setMessage("Account created. If email confirmation is enabled, check your inbox, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else window.location.href = "/dashboard";
    }
    setBusy(false);
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <Link href="/" className="brand"><span className="brandMark">M</span> Money Clarity</Link>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">{mode === "login" ? "Log in to your financial dashboard." : "Start organizing your business finances."}</p>
        <form onSubmit={submit}>
          {mode === "signup" && <label>Full name<input value={name} onChange={e=>setName(e.target.value)} required /></label>}
          <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required /></label>
          <button className="button full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        {message && <div className="notice">{message}</div>}
        <p className="switch">{mode === "login" ? <>New here? <Link href="/signup">Create an account</Link></> : <>Already registered? <Link href="/login">Log in</Link></>}</p>
      </div>
    </main>
  );
}
