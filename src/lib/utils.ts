import { Input } from "postcss";
import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const chatHrefConstructor = (id1: string, id2: string) => {
  const sortedIds = [id1, id2].sort()
  return `${sortedIds[0]}--${sortedIds[1]}`
}