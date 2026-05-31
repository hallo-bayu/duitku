"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types";

export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return; }
    const sb = createClient();
    const today = new Date().toISOString().split("T")[0];
    const startOfMonth = today.slice(0, 7) + "-01";
    const { data } = await sb.from("transactions").select("*")
      .eq("user_id", userId).gte("date", startOfMonth)
      .order("created_at", { ascending: false }).limit(100);
    setTransactions(data || []);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { transactions, isLoading, refetch: fetch };
}
