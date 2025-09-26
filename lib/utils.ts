import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isJson(str: string): boolean {

  try {
    const parsed = JSON.parse(str);
    return  typeof(parsed) == 'object'  && typeof(parsed) != null;
  } catch (_) {
    console.log(_);
    return false;
  }

}