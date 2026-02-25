export function getStatusLabel(status: string, t: (key: string) => string): string {
  const key = `status.${status}`;
  const label = t(key);
  return label === key ? status : label;
}
