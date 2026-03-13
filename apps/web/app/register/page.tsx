"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const COUNTRIES = ["GH", "KE", "NG", "ZA", "ZW", "TZ", "UG", "RW"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Swahili" },
  { code: "zu", label: "Zulu" },
  { code: "yo", label: "Yoruba" },
  { code: "tw", label: "Twi" },
  { code: "sn", label: "Shona" }
];

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    country: "GH",
    language: "en",
    name: "",
    experienceLevel: "beginner"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Registration failed");
        return;
      }
      localStorage.setItem("mm_token", data.token);
      localStorage.setItem("mm_user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container flex min-h-[calc(100vh-4rem)] items-start justify-center py-10">
      <Card className="w-full max-w-xl border-border/70 bg-card/95">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Milestone Markets</p>
          <CardTitle className="font-display text-2xl">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="name">Full Name</label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="email">Email *</label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="password">Password *</label>
              <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Minimum 8 chars" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="country">Country</label>
                <select id="country" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.country} onChange={(e) => set("country", e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="language">Language</label>
                <select id="language" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.language} onChange={(e) => set("language", e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="experience">Experience</label>
              <select id="experience" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account..." : "Create Free Account"}</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-semibold text-primary">Sign in</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
