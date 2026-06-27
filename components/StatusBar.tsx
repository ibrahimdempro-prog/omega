"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ObjectiveProgress {
  pct_objectif: number | null;
  ca_realise_eur: number | null;
  objectif_eur: number | null;
}

interface Workspace {
  id: string;
  name: string | null;
  secteur: string | null;
  status: string | null;
}

function formatEur(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function workspaceLabel(workspace: Workspace): string {
  return (workspace.name ?? "").toUpperCase();
}

export default function StatusBar() {
  const [objective, setObjective] = useState<ObjectiveProgress | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeAgents, setActiveAgents] = useState<number>(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const client = supabase();

        const [objectiveResult, workspacesResult, agentsResult] = await Promise.all([
          client.from("v_objective_progress").select("pct_objectif, ca_realise_eur, objectif_eur").maybeSingle(),
          client.from("workspaces").select("id, name, secteur, status").eq("status", "actif"),
          client
            .from("agents")
            .select("*", { count: "exact", head: true })
            .eq("statut", "actif"),
        ]);

        if (cancelled) return;

        const nextObjective =
          objectiveResult.error || !objectiveResult.data ? null : objectiveResult.data;
        const nextWorkspaces =
          workspacesResult.error || !workspacesResult.data ? [] : workspacesResult.data;
        const nextAgents =
          agentsResult.error || agentsResult.count == null ? 0 : agentsResult.count;

        setObjective(nextObjective);
        setWorkspaces(nextWorkspaces);
        setActiveAgents(nextAgents);
        setHasData(
          nextObjective != null || nextWorkspaces.length > 0 || nextAgents > 0,
        );
      } catch {
        if (!cancelled) {
          setObjective(null);
          setWorkspaces([]);
          setActiveAgents(0);
          setHasData(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const pct = Math.min(objective?.pct_objectif ?? 0, 100);

  return (
    <header
      className="w-full border-b font-mono text-sm"
      style={{
        backgroundColor: "#0A0B0D",
        color: "#E8E6E1",
        borderColor: "#22252A",
      }}
    >
      <style>{`
        @keyframes status-bar-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.85);
          }
        }
        .status-bar-pulse {
          animation: status-bar-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className="status-bar-pulse inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: "#3ECF8E" }}
            aria-hidden
          />
          <span className="tracking-[0.35em]">OMEGA</span>
          <span className="text-[#6B7280]">·</span>
          <span>
            CLAUDE: ORCHESTRATEUR · AGENTS: {loading ? "…" : activeAgents} ACTIFS
          </span>
        </div>

        {loading ? (
          <p className="text-[#6B7280]">Chargement…</p>
        ) : !hasData ? (
          <p className="text-[#6B7280]">Aucune donnée</p>
        ) : (
          <>
            {workspaces.length > 0 && (
              <nav className="flex flex-wrap gap-4 border-b" style={{ borderColor: "#22252A" }}>
                {workspaces.map((workspace, index) => {
                  const isActive = index === activeTab;
                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => setActiveTab(index)}
                      className="cursor-pointer border-b-2 bg-transparent px-1 pb-2 font-mono text-xs tracking-wider transition-colors"
                      style={{
                        color: isActive ? "#FAC775" : "#6B7280",
                        borderBottomColor: isActive ? "#FAC775" : "transparent",
                      }}
                    >
                      {workspaceLabel(workspace)}
                    </button>
                  );
                })}
              </nav>
            )}

            {objective && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span>OBJECTIF PREMIER MILLION</span>
                  <span style={{ color: "#FAC775" }}>
                    {formatEur(objective.ca_realise_eur)} € / {formatEur(objective.objectif_eur)} €
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-sm"
                  style={{ backgroundColor: "#1C1E22" }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: "#FAC775",
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
