"use client";

import { useEffect, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Textarea } from "./components/ui/textarea";

type TabKey = "overview" | "lessons" | "users" | "trades" | "models";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== "false";

function authH() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = typeof window !== "undefined" ? localStorage.getItem("mm_token") : "";
  if (t) {
    headers.Authorization = `Bearer ${t}`;
    return headers;
  }
  if (DEV_BYPASS) {
    headers["x-dev-bypass-user"] = "u-admin";
    headers["x-dev-bypass-role"] = "admin";
    headers["x-dev-bypass-country"] = "GH";
  }
  return headers;
}

async function apiGet(path: string) {
  const res = await fetch(`${API}${path}`, { headers: authH(), cache: "no-store" } as RequestInit);
  return res.ok ? res.json() : null;
}

interface Lesson {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  readingTimeMin: number;
  free: boolean;
}

interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  country?: string;
  accountType?: string;
}

interface Trade {
  id: string;
  userId: string;
  symbol: string;
  action: string;
  qty: number;
  price: number;
  date: string;
  pnl?: number;
}

interface StrategyConfigItem {
  strategy: "advanced_quantitative" | "technical_fundamental_hybrid" | "long_horizon_value";
  country: string;
  enabled: boolean;
  parameters: Record<string, number | string | boolean>;
}

const BLANK_LESSON = {
  slug: "",
  title: "",
  category: "Stock market basics",
  difficulty: "beginner",
  readingTimeMin: 5,
  free: true,
  content: ""
};

export default function AdminHome() {
  const [health, setHealth] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfigItem[]>([]);
  const [newLesson, setNewLesson] = useState({ ...BLANK_LESSON });
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [lessonMsg, setLessonMsg] = useState("");
  const [lessonErr, setLessonErr] = useState("");
  const [tab, setTab] = useState<TabKey>("overview");
  const [modelMsg, setModelMsg] = useState("");

  const refresh = () => {
    apiGet("/api/health").then(setHealth);
    apiGet("/api/admin/dashboard").then(setKpis);
    apiGet("/api/admin/lessons").then((d) => setLessons(d ?? []));
    apiGet("/api/admin/users").then((d) => setUsers(d ?? []));
    apiGet("/api/admin/trades").then((d) => setTrades(d ?? []));
    apiGet("/api/strategies/config").then((d) => setStrategyConfig(d ?? []));
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLessonMsg("");
    setLessonErr("");

    const method = editSlug ? "PUT" : "POST";
    const url = editSlug ? `${API}/api/admin/lessons/${editSlug}` : `${API}/api/admin/lessons`;
    const res = await fetch(url, { method, headers: authH(), body: JSON.stringify(newLesson) });
    const data = await res.json();

    if (!res.ok) {
      setLessonErr(data.message ?? "Failed");
      return;
    }

    setLessonMsg(editSlug ? "Lesson updated." : "Lesson created.");
    setNewLesson({ ...BLANK_LESSON });
    setEditSlug(null);
    apiGet("/api/admin/lessons").then((d) => setLessons(d ?? []));
  };

  const deleteLesson = async (slug: string) => {
    if (!confirm(`Delete lesson "${slug}"?`)) return;
    await fetch(`${API}/api/admin/lessons/${slug}`, { method: "DELETE", headers: authH() });
    apiGet("/api/admin/lessons").then((d) => setLessons(d ?? []));
  };

  const editLesson = (l: Lesson) => {
    setEditSlug(l.slug);
    setNewLesson({
      slug: l.slug,
      title: l.title,
      category: l.category,
      difficulty: l.difficulty,
      readingTimeMin: l.readingTimeMin,
      free: l.free,
      content: ""
    });
    setTab("lessons");
    window.scrollTo(0, 0);
  };

  const set = (k: string, v: any) => setNewLesson((p) => ({ ...p, [k]: v }));

  const toggleModel = async (item: StrategyConfigItem) => {
    setModelMsg("");
    const payload = { ...item, enabled: !item.enabled };
    const res = await fetch(`${API}/api/strategies/config`, {
      method: "PUT",
      headers: authH(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      setModelMsg("Model update failed.");
      return;
    }

    setModelMsg(`Updated ${item.strategy} (${item.country})`);
    apiGet("/api/strategies/config").then((d) => setStrategyConfig(d ?? []));
  };

  return (
    <main className="container py-8 md:py-10">
      <section className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-xl backdrop-blur md:p-8">
        <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
          Milestone Markets Admin
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Control Center</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Manage lessons, users, simulated trading telemetry, and model availability across countries.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["overview", "lessons", "users", "trades", "models"] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={tab === t ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => setTab(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </section>

      {tab === "overview" && (
        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>API and service status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Status:{" "}
                <span className={health?.status === "ok" ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                  {health?.status ?? "..."}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{health?.service ?? "Milestone API"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform KPIs</CardTitle>
              <CardDescription>Operational activity snapshot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>Users: <span className="font-semibold text-foreground">{kpis?.kpis?.users ?? "-"}</span></p>
              <p>Active subscriptions: <span className="font-semibold text-foreground">{kpis?.kpis?.activeSubscriptions ?? "-"}</span></p>
              <p>Countries: <span className="font-semibold text-foreground">{kpis?.kpis?.countries ?? "-"}</span></p>
              <p>Strategies: <span className="font-semibold text-foreground">{kpis?.kpis?.configuredStrategies ?? "-"}</span></p>
              <p>Lessons: <span className="font-semibold text-foreground">{lessons.length}</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin paths</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setTab("lessons")}>Manage Lessons</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setTab("users")}>View Users</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setTab("trades")}>View Trades</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setTab("models")}>Manage Models</Button>
            </CardContent>
          </Card>
        </section>
      )}

      {tab === "models" && (
        <section className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>Enable or disable built-in model families per country.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {modelMsg && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{modelMsg}</p>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyConfig.map((m) => (
                    <TableRow key={`${m.strategy}-${m.country}`}>
                      <TableCell className="font-medium">{m.strategy}</TableCell>
                      <TableCell>{m.country}</TableCell>
                      <TableCell>
                        <Badge variant={m.enabled ? "success" : "danger"}>{m.enabled ? "enabled" : "disabled"}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{JSON.stringify(m.parameters)}</TableCell>
                      <TableCell>
                        <Button type="button" size="sm" variant="outline" onClick={() => toggleModel(m)}>
                          {m.enabled ? "Disable" : "Enable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {strategyConfig.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No model configs available.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {tab === "lessons" && (
        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card>
            <CardHeader>
              <CardTitle>{editSlug ? `Editing: ${editSlug}` : "Create New Lesson"}</CardTitle>
              <CardDescription>Author and maintain educational content.</CardDescription>
            </CardHeader>
            <CardContent>
              {lessonMsg && <p className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{lessonMsg}</p>}
              {lessonErr && <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{lessonErr}</p>}
              <form onSubmit={saveLesson} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug *</label>
                  <Input required value={newLesson.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. understanding-bonds" disabled={!!editSlug} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title *</label>
                  <Input required value={newLesson.title} onChange={(e) => set("title", e.target.value)} placeholder="Lesson title" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</label>
                    <Input value={newLesson.category} onChange={(e) => set("category", e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newLesson.difficulty}
                      onChange={(e) => set("difficulty", e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Read time (min)</label>
                    <Input type="number" min={1} value={newLesson.readingTimeMin} onChange={(e) => set("readingTimeMin", parseInt(e.target.value, 10) || 1)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newLesson.free ? "free" : "premium"}
                      onChange={(e) => set("free", e.target.value === "free")}
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content *</label>
                  <Textarea
                    required={!editSlug}
                    value={newLesson.content}
                    onChange={(e) => set("content", e.target.value)}
                    placeholder="Lesson content..."
                    className="min-h-[180px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editSlug ? "Save Changes" : "Create Lesson"}</Button>
                  {editSlug && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditSlug(null);
                        setNewLesson({ ...BLANK_LESSON });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Lessons ({lessons.length})</CardTitle>
              <CardDescription>Click edit to update any lesson metadata.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessons.map((l) => (
                    <TableRow key={l.slug}>
                      <TableCell className="font-mono text-xs">{l.slug}</TableCell>
                      <TableCell>{l.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{l.difficulty}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.free ? "success" : "warning"}>{l.free ? "Free" : "Premium"}</Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => editLesson(l)}>Edit</Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => deleteLesson(l.slug)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lessons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No lessons yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {tab === "users" && (
        <section className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email / Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-xs">{u.id}</TableCell>
                      <TableCell>{u.name ?? "-"}</TableCell>
                      <TableCell>{u.email ?? (u as any).phone ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{u.role}</Badge>
                      </TableCell>
                      <TableCell>{u.country ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant={u.accountType === "premium" ? "warning" : "success"}>{u.accountType ?? "free"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No users found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {tab === "trades" && (
        <section className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Recent Simulated Trades ({trades.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>P&amp;L</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.userId}</TableCell>
                      <TableCell className="font-semibold">{t.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={t.action.toLowerCase() === "buy" ? "success" : t.action.toLowerCase() === "sell" ? "danger" : "secondary"}>
                          {t.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.qty}</TableCell>
                      <TableCell>${t.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {t.pnl !== undefined ? (
                          <span className={t.pnl >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>
                            {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {trades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">No trades recorded yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
