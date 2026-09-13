// Utility formatters for Cookie Chain tokens, addresses, and currency

/**
 * Format a base58 address to truncated form (e.g. 8nj4...T3AP)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format raw lamports/atoms to COOK (9 decimals)
 */
export function formatCook(lamports: number | bigint | string, decimals = 4): string {
  try {
    const raw = typeof lamports === "string" ? BigInt(lamports) : BigInt(lamports);
    const divisor = 1_000_000_000n;
    const whole = raw / divisor;
    const fraction = raw % divisor;
    if (fraction === 0n) return whole.toString();
    const fracStr = fraction.toString().padStart(9, "0").slice(0, decimals);
    return `${whole}.${fracStr}`.replace(/\.?0+$/, "");
  } catch {
    return "0";
  }
}

/**
 * Format USD values nicely
 */
export function formatUsd(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "$0.00";
  if (val < 0.00001 && val > 0) {
    return `$${val.toExponential(3)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: val < 1 ? 6 : 2,
  }).format(val);
}

/**
 * Format standard number with commas
 */
export function formatNumber(val: number | null | undefined, maxDecimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDecimals,
  }).format(val);
}
