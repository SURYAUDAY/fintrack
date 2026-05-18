import type { QueryCache, MutationCache } from "@tanstack/react-query";

const SLOW_THRESHOLD_MS = 1000;

const queryStarts = new Map<string, number>();
const mutationStarts = new Map<string, number>();

export function attachQueryLogger(
  queryCache: QueryCache,
  mutationCache: MutationCache
) {
  queryCache.subscribe((event) => {
    const key = event.query.queryHash;
    const status = event.query.state.fetchStatus;

    if (status === "fetching" && !queryStarts.has(key)) {
      queryStarts.set(key, performance.now());
      return;
    }

    if (status === "idle" && queryStarts.has(key)) {
      const start = queryStarts.get(key)!;
      queryStarts.delete(key);
      const elapsed = Math.round(performance.now() - start);
      const label = JSON.stringify(event.query.queryKey);
      if (event.query.state.error) {
        console.error(
          `[fintrack:query-failed] ${label} after ${elapsed}ms`,
          event.query.state.error
        );
      } else if (elapsed > SLOW_THRESHOLD_MS) {
        console.warn(
          `[fintrack:slow-query] ${label} took ${elapsed}ms`
        );
      }
    }
  });

  mutationCache.subscribe((event) => {
    if (event.type !== "updated") return;
    const id = String(event.mutation.mutationId);
    const status = event.mutation.state.status;

    if (status === "pending" && !mutationStarts.has(id)) {
      mutationStarts.set(id, performance.now());
      return;
    }

    if ((status === "success" || status === "error") && mutationStarts.has(id)) {
      const start = mutationStarts.get(id)!;
      mutationStarts.delete(id);
      const elapsed = Math.round(performance.now() - start);
      const label = JSON.stringify(event.mutation.options.mutationKey ?? "mutation");
      if (status === "error") {
        console.error(
          `[fintrack:mutation-failed] ${label} after ${elapsed}ms`,
          event.mutation.state.error
        );
      } else if (elapsed > SLOW_THRESHOLD_MS) {
        console.warn(
          `[fintrack:slow-mutation] ${label} took ${elapsed}ms`
        );
      }
    }
  });
}
