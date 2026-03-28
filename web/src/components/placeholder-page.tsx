import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card className="max-w-lg border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Bu modül MVP sonrası (Faz 2) eklenecek. Sol menüden diğer bölümlere
        geçebilirsiniz.
      </CardContent>
    </Card>
  );
}
