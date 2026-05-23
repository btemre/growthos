export function inRange(
  d: Date | null | undefined,
  start: Date,
  end: Date
): boolean {
  if (!d) return false;
  return d >= start && d <= end;
}

export function downloadCsv(filename: string, rows: string[][]) {
  const esc = (cell: string) => {
    if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
    return cell;
  };
  const body = rows.map((r) => r.map(esc).join(",")).join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
