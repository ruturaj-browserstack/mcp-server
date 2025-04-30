/**
 * Creates a configured Fuse instance for token-based fuzzy search.
 * @param list Array of items to search
 * @param keys Keys in each item to index
 * @param options Optional Fuse.js options overrides
 */
export async function createFuzzySearcher<T>(
  list: T[],
  keys: Array<keyof T | string>,
  options?: any,
): Promise<any> {
  const { default: Fuse } = await import("fuse.js");

  const defaultOptions = {
    keys: keys as string[],
    threshold: 0.6,
    includeScore: true,
    useExtendedSearch: false,
    tokenize: true,
    matchAllTokens: false,
    ...options,
  };

  return new Fuse(list, defaultOptions);
}

/**
 * Performs a fuzzy token search over any list, with dynamic keys and options.
 */
export async function fuzzySearch<T>(
  list: T[],
  keys: Array<keyof T | string>,
  query: string,
  limit: number = 5,
  options?: any,
): Promise<T[]> {
  const fuse = await createFuzzySearcher(list, keys, options);
  return fuse.search(query, { limit }).map((result: any) => result.item);
}
