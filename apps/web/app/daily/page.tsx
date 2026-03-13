import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function DailySummaries() {
  return (
    <main className="container py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Daily Market Summaries</h1>
      <p className="mt-2 text-sm text-muted-foreground">Summaries combine exchange activity, corporate actions, and macro indicators by country.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">Ghana</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Banking and telecom led gains as volume remained stable.</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Kenya</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Energy and industrial names saw mixed sentiment.</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Nigeria</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Macro data tempered momentum in consumer staples.</CardContent></Card>
      </div>
    </main>
  );
}
