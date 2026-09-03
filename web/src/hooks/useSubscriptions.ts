import { useEffect, useState } from "react";
import type { Subscription } from "../api/types";
import { listSubscriptions } from "../api/client";

export type SortField = "cost" | "renewal";
export type SortOrder = "asc" | "desc";

interface SubscriptionsState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

interface UseSubscriptionsResult extends SubscriptionsState {
  search: string;
  setSearch: (q: string) => void;
  sort: SortField | null;
  order: SortOrder;
  toggleSort: (field: SortField) => void;
  refetch: () => Promise<void>;
}

export function useSubscriptions(): UseSubscriptionsResult {
  const [state, setState] = useState<SubscriptionsState>({
    subscriptions: [],
    loading: true,
    error: null,
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField | null>(null);
  const [order, setOrder] = useState<SortOrder>("desc");

  const load = async (q: string, sortField: SortField | null, sortOrder: SortOrder) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const subscriptions = await listSubscriptions({
        q: q || undefined,
        sort: sortField ?? undefined,
        order: sortField ? sortOrder : undefined,
      });
      setState({ subscriptions, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load subscriptions",
      }));
    }
  };

  // Debounced search: 250ms after the last keystroke. `load` closes over the
  // current sort state; deps intentionally limited to search changes.
  useEffect(() => {
    const t = setTimeout(() => {
      void load(search, sort, order);
    }, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    void load(search, sort, order);
  }, [sort, order]);

  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
  };

  return {
    ...state,
    search,
    setSearch,
    sort,
    order,
    toggleSort,
    refetch: () => load(search, sort, order),
  };
}
