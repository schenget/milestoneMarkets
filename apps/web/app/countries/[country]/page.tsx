import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const guides: Record<string, { title: string; summary: string }> = {
  ghana: { title: "Ghana Investment Guide", summary: "Currency context, exchange structure, liquidity profile, and sector watchlist." },
  kenya: { title: "Kenya Investment Guide", summary: "NSE opportunities, telecom drivers, and macro triggers for risk management." },
  nigeria: { title: "Nigeria Investment Guide", summary: "Oil-linked macro signals, FX dynamics, and listed equities overview." }
};

export default function CountryGuide({ params }: { params: { country: string } }) {
  const key = params.country.toLowerCase();
  const guide = guides[key] ?? { title: "Country Guide", summary: "Guide will be published soon." };

  return (
    <main className="container py-8">
      <Card>
        <CardHeader><CardTitle>{guide.title}</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">{guide.summary}</CardContent>
      </Card>
    </main>
  );
}
