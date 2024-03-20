import { generateSlug } from "random-word-slugs";
import shuffle from "array-shuffle";

export const generateRandom = (correct: string): string[] =>
  shuffle(generateSlug(2).split("-").concat(correct));

// Generate a list of 5 number random from 1 to 25
export const generateRandomNumber = (number = 25): number[] => {
  const numbers: number[] = [];
  while (numbers.length < 5) {
    // Generate a random number between 1 and 25
    const r = Math.floor(Math.random() * (number - 1) + 1);
    // Check that number isn't repeated
    if (numbers.indexOf(r) === -1) numbers.push(r);
  }
  return numbers;
};
