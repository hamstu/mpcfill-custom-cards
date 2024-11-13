export function getBracket(num: number): number | null {
  // https://imgur.com/a/7Fpy6TE
  const brackets = [
    18, 36, 55, 72, 90, 108, 126, 144, 162, 180, 198, 216, 234, 396, 504, 612,
  ];

  for (let i = 0; i < brackets.length; i++) {
    if (num <= brackets[i]) {
      return brackets[i];
    }
  }

  // If the number is higher than the highest bracket
  return null;
}
