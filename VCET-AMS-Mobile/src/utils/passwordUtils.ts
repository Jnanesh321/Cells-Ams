export function suggestPassword(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const symbols = ['@', '#', '$', '!', '&'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `VCET${digits}${symbol}`;
}

export function generateBulkUSNs(
  baseUSN: string,
  count: number
): string[] {
  const match = baseUSN.match(/^(\d{1}[A-Z]{2}\d{2}[A-Z]{2})(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid USN format: ${baseUSN}. Expected format like 4VP24CS001`);
  }
  const prefix = match[1];
  const startNum = parseInt(match[2], 10);
  const usns: string[] = [];
  for (let i = 0; i < count; i++) {
    usns.push(`${prefix}${String(startNum + i).padStart(3, '0')}`);
  }
  return usns;
}

export function validateUSN(usn: string): boolean {
  return /^\d{1}[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/.test(usn);
}

export function suggestParentPassword(usn: string): string {
  const suffix = usn.slice(-4).toLowerCase();
  return `parent@${suffix}`;
}
