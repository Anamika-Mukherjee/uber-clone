import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//functiont to convert timestamp into date time string with time zone adjustment
export const convertToDateTime = (timestamp: number)=>{
  const dateTime = new Date(timestamp).toLocaleString("en-IN");
  return dateTime;
}
