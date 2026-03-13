import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <main className="container py-8">
      <Card>
        <CardHeader><CardTitle className="capitalize">{params.slug.replace(/-/g, " ")}</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This post template is ready for CMS or markdown ingestion.
        </CardContent>
      </Card>
    </main>
  );
}
