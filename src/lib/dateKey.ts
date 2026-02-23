export function getSingaporeDateKey(date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return fmt.format(date);
}

export function isValidDateKey(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(input);
}
