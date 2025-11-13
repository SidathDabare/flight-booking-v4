import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// function for format string 1 etter to uppercase and rest to lowercase and uppecase first letter of each word
export function formatString(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export const convertToSubcurrency = (amount: number, factor = 100) => {
  return Math.round(amount * factor);
};

// crete function to format if first latter is uppercase and rest are lowercase
export const formatIfFirstLetterUppercase = (str: string) => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
