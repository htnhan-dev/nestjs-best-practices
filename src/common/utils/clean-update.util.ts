export function cleanUpdate<T>(dto: T): Partial<T> {
  const cleaned: Partial<T> = {};

  for (const key in dto) {
    if (!Object.prototype.hasOwnProperty.call(dto, key)) continue;

    const value = dto[key];

    // Loại bỏ undefined, null, empty string
    if (value === undefined) continue;
    if (value === null) continue;
    if (value === '') continue;

    cleaned[key] = value;
  }

  return cleaned;
}
