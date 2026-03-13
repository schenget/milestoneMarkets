"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== "false";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Swahili" },
  { code: "zu", label: "Zulu" },
  { code: "yo", label: "Yoruba" },
  { code: "tw", label: "Twi" },
  { code: "sn", label: "Shona" }
];

interface Profile {
  id: string;
  name?: string | null;
  email?: string | null;
  country?: string;
  language?: string;
  experienceLevel?: string;
  accountType?: string;
  role?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", language: "en", experienceLevel: "beginner" });
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [guest, setGuest] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("mm_token") : null;
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : DEV_BYPASS
      ? {
          "x-dev-bypass-user": "u-admin",
          "x-dev-bypass-role": "admin",
          "x-dev-bypass-country": "GH"
        }
      : {};

  useEffect(() => {
    if (!token && !DEV_BYPASS) {
      setGuest(true);
      return;
    }

    fetch(`${API}/api/users/me`, { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setProfile(d);
        setForm({ name: d.name ?? "", language: d.language ?? "en", experienceLevel: d.experienceLevel ?? "beginner" });
      })
      .catch(() => {});
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message ?? "Update failed");
        setMsgType("error");
        return;
      }

      setProfile((p) => ({ ...p!, ...data }));
      localStorage.setItem("mm_user", JSON.stringify({ ...JSON.parse(localStorage.getItem("mm_user") ?? "{}"), name: data.name }));
      setMessage("Profile updated successfully.");
      setMsgType("success");
      setEdit(false);
    } catch {
      setMessage("Network error.");
      setMsgType("error");
    }
  };

  const signOut = () => {
    localStorage.removeItem("mm_token");
    localStorage.removeItem("mm_user");
    window.location.href = "/";
  };

  if (guest) {
    return (
      <main className="container py-8">
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your profile.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/login"><Button>Sign In</Button></Link>
          <Link href="/register"><Button variant="outline">Create Account</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Profile</h1>

      <Card className="mt-5">
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-border pb-2"><span className="text-muted-foreground">Email</span><span className="font-medium">{profile?.email ?? "-"}</span></div>
          <div className="flex items-center justify-between border-b border-border pb-2"><span className="text-muted-foreground">Name</span><span className="font-medium">{profile?.name ?? "Not set"}</span></div>
          <div className="flex items-center justify-between border-b border-border pb-2"><span className="text-muted-foreground">Country</span><span className="font-medium">{profile?.country ?? "-"}</span></div>
          <div className="flex items-center justify-between border-b border-border pb-2"><span className="text-muted-foreground">Language</span><span className="font-medium">{LANGUAGES.find((l) => l.code === profile?.language)?.label ?? profile?.language ?? "English"}</span></div>
          <div className="flex items-center justify-between border-b border-border pb-2"><span className="text-muted-foreground">Experience</span><span className="font-medium capitalize">{profile?.experienceLevel ?? "beginner"}</span></div>
          <div className="flex items-center justify-between border-b border-border pb-2"><span className="text-muted-foreground">Tier</span><Badge variant={profile?.accountType === "premium" ? "default" : "secondary"}>{profile?.accountType === "premium" ? "Premium" : "Free"}</Badge></div>
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium capitalize">{profile?.role ?? "-"}</span></div>
        </CardContent>
      </Card>

      {!edit ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEdit(true)}>Edit Profile</Button>
          {profile?.accountType !== "premium" && <Link href="/register"><Button>Upgrade</Button></Link>}
          <Button variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      ) : (
        <Card className="mt-5 max-w-xl">
          <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
          <CardContent>
            {message && <p className={msgType === "success" ? "mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700" : "mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700"}>{message}</p>}
            <form onSubmit={saveProfile} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="name">Full Name</label>
                <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="language">Language</label>
                  <select id="language" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}>
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="experience">Experience</label>
                  <select id="experience" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.experienceLevel} onChange={(e) => setForm((p) => ({ ...p, experienceLevel: e.target.value }))}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => { setEdit(false); setMessage(""); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {message && !edit && <p className={msgType === "success" ? "mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700" : "mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700"}>{message}</p>}
    </main>
  );
}
