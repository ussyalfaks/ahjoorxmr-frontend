"use client";

import { useState, useMemo } from "react";
import { Calculator, Calendar, DollarSign, Users, Clock, Info } from "lucide-react";

export type Frequency = "Daily" | "Weekly" | "Bi-weekly" | "Monthly";

const FREQUENCY_DAYS: Record<Frequency, number> = {
  "Daily": 1,
  "Weekly": 7,
  "Bi-weekly": 14,
  "Monthly": 30,
};

function getFrequencyFromDays(days: number): string {
  if (days === 1) return "Daily";
  if (days === 7) return "Weekly";
  if (days === 14) return "Bi-weekly";
  if (days === 30) return "Monthly";
  return `Every ${days} days`;
}

interface SavingsCalculatorProps {
  // Controlled props for preview mode
  amount?: number;
  participants?: number;
  frequencyDays?: number;
  
  // Uncontrolled initial values for standalone mode
  defaultAmount?: number;
  defaultParticipants?: number;
  defaultFrequency?: Frequency;
  
  isReadOnly?: boolean;
}

export default function SavingsCalculator({
  amount: controlledAmount,
  participants: controlledParticipants,
  frequencyDays: controlledFrequencyDays,
  defaultAmount = 50,
  defaultParticipants = 5,
  defaultFrequency = "Weekly",
  isReadOnly = false,
}: SavingsCalculatorProps) {
  // Local state for standalone mode
  const [localAmount, setLocalAmount] = useState<string>(defaultAmount.toString());
  const [localParticipants, setLocalParticipants] = useState<string>(defaultParticipants.toString());
  const [localFrequency, setLocalFrequency] = useState<Frequency>(defaultFrequency);

  const amount = isReadOnly ? (controlledAmount || 0) : (Number(localAmount) || 0);
  const participants = isReadOnly ? (controlledParticipants || 0) : (Number(localParticipants) || 0);
  const daysPerRound = isReadOnly 
    ? (controlledFrequencyDays || 7) 
    : FREQUENCY_DAYS[localFrequency];

  // Validation bounds
  const isValidAmount = amount > 0;
  const isValidParticipants = participants >= 2 && participants <= 20;
  
  const totalPayout = amount * participants;
  const totalDurationDays = participants * daysPerRound;

  // Generate schedule
  const schedule = useMemo(() => {
    if (!isValidAmount || !isValidParticipants) return [];
    
    const dates = [];
    let currentDate = new Date();
    
    for (let i = 1; i <= participants; i++) {
      // Add days
      currentDate = new Date(currentDate.getTime() + daysPerRound * 24 * 60 * 60 * 1000);
      dates.push({
        round: i,
        date: currentDate,
        amount: totalPayout,
      });
    }
    return dates;
  }, [amount, participants, daysPerRound, isValidAmount, isValidParticipants]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
  };

  return (
    <div className="bg-[var(--modal)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
      {!isReadOnly && (
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#4B6B76]/10 flex items-center justify-center">
            <Calculator className="text-[#4B6B76]" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sora text-[var(--text)]">Savings Simulator</h2>
            <p className="text-[var(--muted)] text-sm">Calculate your projected payouts</p>
          </div>
        </div>
      )}

      <div className={`grid gap-8 ${isReadOnly ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        {/* Controls Section */}
        {!isReadOnly && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-[var(--text)] mb-2 block flex justify-between">
                Contribution per round
                <span className="text-[var(--muted)] font-normal">USDT</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-[var(--muted)]" />
                </div>
                <input
                  type="number"
                  min="1"
                  value={localAmount}
                  onChange={(e) => setLocalAmount(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] transition-shadow"
                />
              </div>
              {!isValidAmount && localAmount !== "" && (
                <p className="text-red-500 text-xs mt-1.5">Amount must be greater than 0</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text)] mb-2 block flex justify-between">
                Number of participants
                <span className="text-[var(--muted)] font-normal">2 - 20 max</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Users size={18} className="text-[var(--muted)]" />
                </div>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={localParticipants}
                  onChange={(e) => setLocalParticipants(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76] transition-shadow"
                />
              </div>
              {!isValidParticipants && localParticipants !== "" && (
                <p className="text-red-500 text-xs mt-1.5">Participants must be between 2 and 20</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--text)] mb-2 block">
                Round frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FREQUENCY_DAYS) as Frequency[]).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setLocalFrequency(freq)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-colors border ${
                      localFrequency === freq
                        ? "bg-[#4B6B76] text-white border-[#4B6B76]"
                        : "bg-[var(--background)] text-[var(--text)] border-[var(--border)] hover:border-[#4B6B76]"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className={`space-y-6 ${isReadOnly ? '' : 'bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)]'}`}>
          {!isReadOnly && <h3 className="font-semibold text-[var(--text)] mb-4 font-sora">Simulation Results</h3>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--ov-0a)] p-4 rounded-xl">
              <p className="text-[var(--muted)] text-xs font-medium mb-1 flex items-center gap-1.5">
                <DollarSign size={14} /> Total Payout
              </p>
              <p className="text-2xl font-bold font-sora text-[var(--text)]">
                {isValidAmount && isValidParticipants ? `$${totalPayout.toLocaleString()}` : '—'}
              </p>
            </div>
            
            <div className="bg-[var(--ov-0a)] p-4 rounded-xl">
              <p className="text-[var(--muted)] text-xs font-medium mb-1 flex items-center gap-1.5">
                <Clock size={14} /> Duration
              </p>
              <p className="text-2xl font-bold font-sora text-[var(--text)]">
                {isValidAmount && isValidParticipants ? `${totalDurationDays} days` : '—'}
              </p>
            </div>
          </div>

          <div className="bg-[#4B6B76]/10 border border-[#4B6B76]/20 rounded-xl p-4 flex items-start gap-3">
            <Info size={18} className="text-[#4B6B76] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text)]">
              Each round, all {isValidParticipants ? participants : '—'} members contribute {isValidAmount ? `$${amount}` : '—'}, 
              and one person receives the total pool of {isValidAmount && isValidParticipants ? `$${totalPayout}` : '—'}. 
              Frequency: {isReadOnly ? getFrequencyFromDays(daysPerRound) : localFrequency}.
            </p>
          </div>

          {isValidAmount && isValidParticipants && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-[var(--muted)]" />
                Projected Payout Schedule
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {schedule.map((item) => (
                  <div key={item.round} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--ov-1a)] flex items-center justify-center text-xs font-medium text-[var(--text)]">
                        {item.round}
                      </div>
                      <span className="text-sm text-[var(--muted)]">{formatDate(item.date)}</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text)]">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
