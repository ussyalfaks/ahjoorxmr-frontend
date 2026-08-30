"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowUpRight, Users, CheckCircle2, DollarSign, GripHorizontal, EyeOff, ArrowUp, ArrowDown, Settings2, RotateCcw, Plus } from "lucide-react";
import SavingsCard from "@/components/cards/SavingsCard";
import SavingsGrowthChart from "@/components/charts/SavingsGrowthChart";
import UpcomingPayoutsCalendar from "@/components/dashboard/UpcomingPayoutsCalendar";
import TxConfirmModal, { TxType } from "@/components/modals/TxConfirmModal";
import FeatureSpotlight from "@/components/ui/FeatureSpotlight";
import type { Circle } from "@/types/circle";

interface PendingTx {
  type: TxType;
  circle: Circle;
  amount: number;
}

type WidgetId = 'stats' | 'chart' | 'active-savings' | 'payouts-calendar';

interface WidgetLayout {
  id: WidgetId;
  visible: boolean;
}

const DEFAULT_LAYOUT: WidgetLayout[] = [
  { id: 'stats', visible: true },
  { id: 'chart', visible: true },
  { id: 'active-savings', visible: true },
  { id: 'payouts-calendar', visible: true },
];

const WIDGET_TITLES: Record<WidgetId, string> = {
  'stats': 'Overview Stats',
  'chart': 'Savings Growth',
  'active-savings': 'Active Savings',
  'payouts-calendar': 'Upcoming Payouts'
};

/**
 * contributionButtonLabel looks like "Make Contribution (50 USDT)".
 * Pulls the numeric amount out so the modal can display/use a clean number.
 * Falls back to parsing `circle.contribution` (e.g. "40 USDT") if that fails.
 */
function getContributionAmount(circle: Circle): number {
  const fromLabel = circle.contributionButtonLabel.match(/([\d.]+)\s*USDT/i);
  if (fromLabel) return parseFloat(fromLabel[1]);

  const fromContribution = circle.contribution.match(/([\d.]+)/);
  return fromContribution ? parseFloat(fromContribution[1]) : 0;
}

export default function DashboardOverviewPage() {
  const [pendingTx, setPendingTx] = useState<PendingTx | null>(null);
  const [layout, setLayout] = useState<WidgetLayout[]>(DEFAULT_LAYOUT);
  const [isClient, setIsClient] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('ahjoor-dashboard-layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WidgetLayout[];
        // Basic validation
        if (Array.isArray(parsed) && parsed.length === DEFAULT_LAYOUT.length) {
          setLayout(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveLayout = (newLayout: WidgetLayout[]) => {
    setLayout(newLayout);
    localStorage.setItem('ahjoor-dashboard-layout', JSON.stringify(newLayout));
  };

  const resetLayout = () => {
    saveLayout(DEFAULT_LAYOUT);
    setIsCustomizeOpen(false);
  };

  const toggleVisibility = (id: WidgetId, force?: boolean) => {
    const newLayout = layout.map(w => w.id === id ? { ...w, visible: force !== undefined ? force : !w.visible } : w);
    saveLayout(newLayout);
  };

  const moveWidget = (idx: number, direction: -1 | 1) => {
    if (idx + direction < 0 || idx + direction >= layout.length) return;
    const newLayout = [...layout];
    const temp = newLayout[idx];
    newLayout[idx] = newLayout[idx + direction];
    newLayout[idx + direction] = temp;
    saveLayout(newLayout);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the ghost to be generated before styling the original
    setTimeout(() => {
      // additional drag styling logic if needed
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    const newLayout = [...layout];
    const [removed] = newLayout.splice(draggedIdx, 1);
    newLayout.splice(targetIdx, 0, removed);
    
    saveLayout(newLayout);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const deadlines = useMemo(
    () => ({
      card1: new Date(Date.now() + 25 * 60 * 1000),
      card2: new Date(Date.now() + 18 * 60 * 60 * 1000),
      card3: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      card4: null,
    }),
    []
  );

  const circles: Circle[] = useMemo(
    () => [
      {
        id: "1",
        name: "Family savings",
        creator: "Emeka",
        members: 2,
        contribution: "3 USDT",
        duration: "2 Days",
        currentRound: 1,
        totalRounds: 3,
        status: "active",
        isYourTurn: true,
        deadline: deadlines.card1,
        contributionButtonLabel: "Make Contribution (50 USDT)",
        claimButtonVariant: "secondary",
      },
      {
        id: "2",
        name: "School fees",
        creator: "Emmanuel",
        members: 6,
        contribution: "40 USDT",
        duration: "12 Days",
        currentRound: 3,
        totalRounds: 4,
        status: "active",
        isYourTurn: false,
        deadline: deadlines.card2,
        contributionButtonLabel: "Make Contribution (2 USDT)",
        claimButtonVariant: "disabled",
      },
      {
        id: "3",
        name: "Family savings",
        creator: "Emeka",
        members: 2,
        contribution: "30 USDT",
        duration: "2 Days",
        currentRound: 1,
        totalRounds: 3,
        status: "active",
        isYourTurn: true,
        deadline: deadlines.card3,
        contributionButtonLabel: "Make Contribution (5 USDT)",
        claimButtonVariant: "primary",
      },
      {
        id: "4",
        name: "School fees",
        creator: "Emmanuel",
        members: 4,
        contribution: "40 USDT",
        duration: "12 Days",
        currentRound: 2,
        totalRounds: 5,
        status: "active",
        isYourTurn: false,
        deadline: deadlines.card4,
        contributionButtonLabel: "Make Contribution (10 USDT)",
        claimButtonVariant: "disabled",
      },
    ],
    [deadlines]
  );

  const handleContributeClick = (circle: Circle) => {
    setPendingTx({
      type: "contribute",
      circle,
      amount: getContributionAmount(circle),
    });
  };

  const handleClaimClick = (circle: Circle) => {
    setPendingTx({
      type: "claim",
      circle,
      amount: getContributionAmount(circle),
    });
  };

  const submitContribution = async (circle: Circle, amount: number): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";
  };

  const submitClaim = async (circle: Circle): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567";
  };

  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--modal)] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[var(--content-hover)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
                <DollarSign size={20} className="text-[var(--text)]" aria-hidden="true" />
              </div>
              <p className="text-[var(--muted)] text-sm font-medium mb-2">Total Saved</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-semibold font-sora tracking-tight text-[var(--text)]">$1000</h3>
                <div className="flex items-center gap-1 text-[var(--success)] text-xs font-semibold" aria-label="200% increase">
                  <span>+200%</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--modal)] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[var(--content-hover)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
                <Users size={20} className="text-[var(--text)]" aria-hidden="true" />
              </div>
              <p className="text-[var(--muted)] text-sm font-medium mb-2">Active Pools</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-semibold font-sora tracking-tight text-[var(--text)]">8</h3>
                <div className="flex items-center gap-1 text-[var(--success)] text-xs font-semibold" aria-label="200% increase">
                  <span>+200%</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--modal)] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[var(--content-hover)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
                <div className="relative" aria-hidden="true">
                  <DollarSign size={16} className="text-[var(--text)] absolute -top-1 -right-1" />
                  <div className="w-5 h-4 border-2 border-white rounded-sm mt-1" />
                </div>
              </div>
              <p className="text-[var(--muted)] text-sm font-medium mb-2">Next Payout</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-semibold font-sora tracking-tight text-[var(--text)]">$50</h3>
                <div className="flex items-center gap-1 text-[var(--success)] text-xs font-semibold" aria-label="200% increase">
                  <span>+200%</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--modal)] p-6 rounded-2xl flex flex-col relative overflow-hidden group hover:bg-[var(--content-hover)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[var(--ov-0a)] flex items-center justify-center mb-6">
                <CheckCircle2 size={20} className="text-[var(--text)]" aria-hidden="true" />
              </div>
              <p className="text-[var(--muted)] text-sm font-medium mb-2">Completed Circles</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-semibold font-sora tracking-tight text-[var(--text)]">12</h3>
                <div className="flex items-center gap-1 text-[var(--success)] text-xs font-semibold" aria-label="200% increase">
                  <span>+200%</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'chart':
        return <SavingsGrowthChart />;
      case 'active-savings':
        return (
          <div>
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-bold font-sora text-[var(--text)] shrink-0">Active savings</h2>
              <div className="ml-4 h-px bg-[var(--ov-1a)] w-full" aria-hidden="true" />
            </div>
            <div className="space-y-4">
              {circles.map((circle) => (
                <SavingsCard
                  key={circle.id}
                  circle={circle}
                  onContribute={handleContributeClick}
                  onClaim={handleClaimClick}
                />
              ))}
            </div>
          </div>
        );
      case 'payouts-calendar':
        return <UpcomingPayoutsCalendar circles={circles} />;
      default:
        return null;
    }
  };

  const hiddenWidgets = layout.filter(w => !w.visible);

  return (
    <div className="pb-20 md:pb-0 relative min-h-screen">
      {/* Top action bar */}
      {isClient && (
        <div className="flex justify-end mb-6 relative">
          <div className="relative">
            <FeatureSpotlight featureId="dashboard-customize" align="right">
              <button 
                onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-[var(--modal)] border border-[var(--border)] hover:bg-[var(--content-hover)] transition-colors text-[var(--text)]"
              >
                <Settings2 size={16} />
                Customize Layout
              </button>
            </FeatureSpotlight>
            
            {isCustomizeOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--modal)] border border-[var(--border)] rounded-xl shadow-xl p-4 z-50">
                <h4 className="text-sm font-semibold mb-3 text-[var(--text)]">Hidden Widgets</h4>
                {hiddenWidgets.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {hiddenWidgets.map(w => (
                      <div key={w.id} className="flex items-center justify-between bg-[var(--background)] px-3 py-2 rounded-lg border border-[var(--border)]">
                        <span className="text-sm text-[var(--text)]">{WIDGET_TITLES[w.id]}</span>
                        <button 
                          onClick={() => toggleVisibility(w.id, true)}
                          className="p-1 hover:bg-[var(--ov-0a)] rounded text-[var(--text)]"
                          title="Show Widget"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--muted)] mb-4">All widgets are currently visible.</p>
                )}
                
                <div className="h-px bg-[var(--border)] w-full mb-3" />
                <button 
                  onClick={resetLayout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset to Default
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widgets Flow */}
      <div className="space-y-6">
        {isClient ? layout.map((widget, idx) => {
          if (!widget.visible) return null;
          const isDragged = draggedIdx === idx;
          
          return (
            <div 
              key={widget.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative group transition-all duration-200 ${isDragged ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between mb-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity h-8 px-1">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <button 
                    className="cursor-grab active:cursor-grabbing p-1 hover:text-[var(--text)] hover:bg-[var(--ov-0a)] rounded transition-colors" 
                    aria-label={`Drag ${WIDGET_TITLES[widget.id]}`}
                  >
                    <GripHorizontal size={16} />
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wider">{WIDGET_TITLES[widget.id]}</span>
                </div>
                
                <div className="flex items-center gap-1 bg-[var(--modal)] rounded-lg border border-[var(--border)] p-1 shadow-sm">
                  <button 
                    onClick={() => moveWidget(idx, -1)} 
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    onClick={() => moveWidget(idx, 1)} 
                    disabled={idx === layout.length - 1}
                    className="p-1 rounded hover:bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <div className="w-px h-4 bg-[var(--border)] mx-1" />
                  <button 
                    onClick={() => toggleVisibility(widget.id, false)}
                    className="p-1 rounded hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors"
                    aria-label="Hide Widget"
                  >
                    <EyeOff size={14} />
                  </button>
                </div>
              </div>
              
              <div className={isDragged ? 'pointer-events-none' : ''}>
                {renderWidgetContent(widget.id)}
              </div>
            </div>
          );
        }) : (
          /* Server-side / Initial rendering fallback */
          <>
            <div className="mt-8 mb-6">{renderWidgetContent('stats')}</div>
            <div className="mb-6">{renderWidgetContent('chart')}</div>
            <div className="mb-6">{renderWidgetContent('active-savings')}</div>
            <div>{renderWidgetContent('payouts-calendar')}</div>
          </>
        )}
      </div>

      {pendingTx && (
        <TxConfirmModal
          isOpen={!!pendingTx}
          onClose={() => setPendingTx(null)}
          type={pendingTx.type}
          circleName={pendingTx.circle.name}
          amount={pendingTx.amount}
          onConfirm={() =>
            pendingTx.type === "contribute"
              ? submitContribution(pendingTx.circle, pendingTx.amount)
              : submitClaim(pendingTx.circle)
          }
        />
      )}
    </div>
  );
}