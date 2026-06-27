"use client";

import { useEffect, useState } from "react";
import { FileText, LineChart, Plug, Rocket, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

type DotColor = "green" | "amber" | "grey";

interface ModuleRow {
  icon: React.ReactNode;
  label: string;
  subtext: string;
  dot: DotColor;
}

const DOT_COLORS: Record<DotColor, string> = {
  green: "#3ECF8E",
  amber: "#FAC775",
  grey: "#6B7280",
};

function formatEur(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

async function safeCount(
  promise: PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  try {
    const { count, error } = await promise;
    if (error || count == null) return 0;
    return count;
  } catch {
    return 0;
  }
}

const DEFAULT_ROWS: ModuleRow[] = [
  {
    icon: <Users size={15} style={{ color: "#6B7280" }} aria-hidden />,
    label: "PIPELINE",
    subtext: "0 leads · 0 RDV",
    dot: "grey",
  },
  {
    icon: <Plug size={15} style={{ color: "#6B7280" }} aria-hidden />,
    label: "INTÉGRATIONS",
    subtext: "0/0 connectées",
    dot: "grey",
  },
  {
    icon: <FileText size={15} style={{ color: "#6B7280" }} aria-hidden />,
    label: "CONTRATS",
    subtext: "0 devis en attente",
    dot: "grey",
  },
  {
    icon: <Rocket size={15} style={{ color: "#6B7280" }} aria-hidden />,
    label: "CROISSANCE",
    subtext: "Landing brouillon · Ads 0€",
    dot: "grey",
  },
  {
    icon: <LineChart size={15} style={{ color: "#6B7280" }} aria-hidden />,
    label: "TRÉSORERIE",
    subtext: "Aucune projection",
    dot: "grey",
  },
];

export default function ModulesPanel() {
  const [rows, setRows] = useState<ModuleRow[]>(DEFAULT_ROWS);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const client = supabase();

        const { data: workspace, error: workspaceError } = await client
          .from("workspaces")
          .select("id")
          .eq("status", "actif")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (workspaceError || !workspace?.id) {
          setRows(DEFAULT_ROWS);
          return;
        }

        const wsId = workspace.id;

        const [
          leadsTotal,
          leadsRdv,
          integrationsTotal,
          integrationsConnected,
          contractsPending,
          landingResult,
          campaignsResult,
          forecastResult,
        ] = await Promise.all([
          safeCount(
            client
              .from("leads")
              .select("*", { count: "exact", head: true })
              .eq("workspace_id", wsId),
          ),
          safeCount(
            client
              .from("leads")
              .select("*", { count: "exact", head: true })
              .eq("workspace_id", wsId)
              .eq("stage", "rdv"),
          ),
          safeCount(
            client
              .from("workspace_integrations")
              .select("*", { count: "exact", head: true })
              .eq("workspace_id", wsId),
          ),
          safeCount(
            client
              .from("workspace_integrations")
              .select("*", { count: "exact", head: true })
              .eq("workspace_id", wsId)
              .eq("statut", "connecte"),
          ),
          safeCount(
            client
              .from("contracts")
              .select("*", { count: "exact", head: true })
              .eq("workspace_id", wsId)
              .in("statut", ["brouillon", "envoye"]),
          ),
          client.from("landing_pages").select("statut").eq("workspace_id", wsId),
          client.from("growth_campaigns").select("depense_eur").eq("workspace_id", wsId),
          client
            .from("revenue_forecasts")
            .select("mrr_projete_eur")
            .eq("workspace_id", wsId)
            .order("periode", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        let integrationsDot: DotColor = "grey";
        if (integrationsTotal > 0) {
          integrationsDot =
            integrationsConnected === integrationsTotal ? "green" : "amber";
        }

        const landingPages =
          landingResult.error || !landingResult.data ? [] : landingResult.data;
        const landingDeployed = landingPages.some((page) => page.statut === "deployee");
        const landingLabel = landingDeployed ? "déployée" : "brouillon";

        const campaigns =
          campaignsResult.error || !campaignsResult.data ? [] : campaignsResult.data;
        const adsSpend = campaigns.reduce((sum, campaign) => {
          const value = campaign.depense_eur;
          return sum + (typeof value === "number" && !Number.isNaN(value) ? value : 0);
        }, 0);

        const forecast =
          forecastResult.error || !forecastResult.data ? null : forecastResult.data;
        const mrr = forecast?.mrr_projete_eur;

        setRows([
          {
            icon: <Users size={15} style={{ color: "#6B7280" }} aria-hidden />,
            label: "PIPELINE",
            subtext: `${leadsTotal} leads · ${leadsRdv} RDV`,
            dot: leadsTotal > 0 ? "green" : "grey",
          },
          {
            icon: <Plug size={15} style={{ color: "#6B7280" }} aria-hidden />,
            label: "INTÉGRATIONS",
            subtext: `${integrationsConnected}/${integrationsTotal} connectées`,
            dot: integrationsDot,
          },
          {
            icon: <FileText size={15} style={{ color: "#6B7280" }} aria-hidden />,
            label: "CONTRATS",
            subtext: `${contractsPending} devis en attente`,
            dot: contractsPending > 0 ? "amber" : "grey",
          },
          {
            icon: <Rocket size={15} style={{ color: "#6B7280" }} aria-hidden />,
            label: "CROISSANCE",
            subtext: `Landing ${landingLabel} · Ads ${formatEur(adsSpend)}€`,
            dot: landingDeployed ? "green" : "grey",
          },
          {
            icon: <LineChart size={15} style={{ color: "#6B7280" }} aria-hidden />,
            label: "TRÉSORERIE",
            subtext:
              mrr != null && !Number.isNaN(mrr)
                ? `MRR projeté ${formatEur(mrr)}€`
                : "Aucune projection",
            dot: "grey",
          },
        ]);
      } catch {
        if (!cancelled) {
          setRows(DEFAULT_ROWS);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="w-full font-mono"
      style={{ backgroundColor: "#13151A", padding: "10px 12px" }}
    >
      {rows.map((row, index) => (
        <div
          key={row.label}
          className="flex gap-3 py-3 first:pt-0 last:pb-0"
          style={{
            borderBottom: index < rows.length - 1 ? "1px solid #1C1E22" : undefined,
          }}
        >
          <div className="mt-0.5 shrink-0">{row.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span
                className="tracking-[0.2em]"
                style={{ fontSize: "11px", color: "#9C9A95" }}
              >
                {row.label}
              </span>
              <span
                className="inline-block shrink-0 rounded-full"
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: DOT_COLORS[row.dot],
                }}
                aria-hidden
              />
            </div>
            <p style={{ fontSize: "12px", color: "#D9D7D2" }}>{row.subtext}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
