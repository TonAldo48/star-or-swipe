import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function getRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
