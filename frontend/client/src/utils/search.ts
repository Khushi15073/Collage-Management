export type SearchValue = string | number | boolean | null | undefined;

function normalizeSearchValue(value: SearchValue) {
  return String(value ?? "").trim().toLowerCase();
}

export function buildSearchText(values: SearchValue[]) {
  return values
    .map(normalizeSearchValue)
    .filter(Boolean)
    .join(" ");
}

export function matchesSearchQuery(values: SearchValue[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return buildSearchText(values).includes(normalizedQuery);
}
