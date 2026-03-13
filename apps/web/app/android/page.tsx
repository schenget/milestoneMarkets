import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function AndroidPlaceholder() {
  return (
    <main className="container py-8">
      <Card>
        <CardHeader><CardTitle>Android App Placeholder</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Native Android channel is planned for a later release. Current channels include WhatsApp, USSD, SMS, and 2G web.
        </CardContent>
      </Card>
    </main>
  );
}
