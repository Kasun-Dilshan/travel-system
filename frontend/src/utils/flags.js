/** Treat DB/API flag values correctly ("0" must be false; !! "0" is true in JS). */
export function isTruthyFlag(value) {
  return value === true || value === 1 || value === '1';
}
