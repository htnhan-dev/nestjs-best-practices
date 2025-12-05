export function slugify(text: string): string {
  if (typeof text !== 'string' || !text.trim()) {
    return '';
  }

  return (
    text
      // 1. Normalize Unicode characters (remove accents)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // 2. Convert to lowercase
      .toLowerCase()
      // 3. Remove invalid characters (keep letters, numbers, spaces, and hyphens)
      .replace(/[^a-z0-9\s-]/g, '')
      // 4. Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // 5. Collapse multiple hyphens
      .replace(/-+/g, '-')
      // 6. Trim hyphens from start and end
      .replace(/^-+|-+$/g, '')
  );
}
