type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[];

/**
 * Lightweight class-name combiner compatible with shadcn / Kokonut UI components.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const append = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      const trimmed = String(value).trim();
      if (trimmed) classes.push(trimmed);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        append(item);
      }
    }
  };

  for (const input of inputs) {
    append(input);
  }

  return classes.join(' ');
}
