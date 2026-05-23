"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg border-destructive/30">
      <CardHeader>
        <CardTitle>Bir hata oluştu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Sayfa yüklenirken bir sorun oluştu. Firestore bağlantınızı ve oturumunuzu
          kontrol edin, ardından tekrar deneyin.
        </p>
        {error.message ? (
          <p className="rounded-md bg-muted p-2 font-mono text-xs text-foreground">
            {error.message}
          </p>
        ) : null}
        <Button type="button" onClick={() => reset()}>
          Tekrar dene
        </Button>
      </CardContent>
    </Card>
  );
}
