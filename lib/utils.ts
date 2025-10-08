import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isJson(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    // Make sure parsed is not null and is an object or array
    return (
      parsed !== null && (typeof parsed === "object" || Array.isArray(parsed))
    );
  } catch (_) {
    console.log("Invalid JSON:", _);
    return false;
  }
}