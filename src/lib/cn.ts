import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

/**
 * The one class merger. Every component in this package takes a `className`
 * and merges it here, so a consumer's override always wins over the default
 * rather than depending on stylesheet order.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
