export function numToRank(rank: number): string | null {
  if (!Number.isInteger(rank) || rank <= 0) {
    return null;
  }

  const lastTwoDigits = String(rank).slice(-2);
  const lastDigit = lastTwoDigits.slice(-1);
  if (
    lastTwoDigits === '11' ||
    lastTwoDigits === '12' ||
    lastTwoDigits === '13'
  ) {
    return `${rank}th`;
  }

  switch (lastDigit) {
    case '1':
      return `${rank}st`;
    case '2':
      return `${rank}nd`;
    case '3':
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
}

export function deSnakeCase(str: string): string {
  // replace underscores with spaces and capitalize each word
  const words = str.split('_');
  const newStr = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
  return newStr;
}
