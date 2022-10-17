/**
 * Return a random(ish) selected item from the given array.
 */
export const getRandomItem = <T>(input: T[]): T => {
  return input[(input.length * Math.random()) | 0]
}

/**
 * Return a random integer that's within the given range (inclusive of the min + max values).
 */
export const getRandomIntFromRange = (min: number, max: number): number => {
  const minCeil = Math.ceil(min)

  return Math.floor(Math.random() * (Math.floor(max) - minCeil + 1) + minCeil)
}

/**
 * Return a new array with the input array's items shuffled in a random order.
 * A useful first step to picking n unique random values from an array.
 */
export const shuffle = <T>(input: T[]): T[] => {
  return input
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}
