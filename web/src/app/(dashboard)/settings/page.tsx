import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatVersionLabel, getBuildInfo } from "@/lib/build-info";

export default function SettingsPage() {
  const { version, buildTime, gitSha } = getBuildInfo();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">
          Hesap ve uygulama tercihleri (yakında).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Uygulama sürümü</CardTitle>
          <CardDescription>
            Build sırasında <code className="text-xs">web/version.json</code>{" "}
            güncellenir; kalıcı artış için dosyayı commit edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-mono text-base font-medium tabular-nums">
            {formatVersionLabel(version)}
          </p>
          {buildTime ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Build zamanı:</span>{" "}
              {buildTime}
            </p>
          ) : null}
          {gitSha ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Commit:</span>{" "}
              <span className="font-mono text-xs">{gitSha}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
