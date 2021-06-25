export function slugify(value: string): string {
  value = value.toLowerCase();
  value = value.replace(/[^a-z0-9]/g, '_');
  value = value.replace(/_{2,}/g, '_');
  value = value.replace(/^_+/g, '');
  value = value.replace(/_+$/g, '');
  return value;
}
