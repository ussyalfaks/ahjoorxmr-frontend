"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, ChevronDown, Clock3, Download, Filter, Receipt, X, XCircle } from "lucide-react";
import ExportButton from "@/components/ui/ExportButton";
import { CONTRIBUTION_CIRCLE_OPTIONS, MOCK_CONTRIBUTIONS } from "@/data/contributions";
import type { ContributionRecord, ContributionStatus } from "@/types/contribution";
import type { ExportRow } from "@/lib/export";
import { useLoadMore } from "@/hooks/useLoadMore";

const STATUS_OPTIONS: Array<{ value: "all" | ContributionStatus; label: string }> = [
    { value: "all", label: "All statuses" },
    { value: "on-time", label: "On-time" },
    { value: "late", label: "Late" },
    { value: "missed", label: "Missed" },
];

function formatDate(value: string) {
    if (!value) return "Not recorded";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function statusMeta(status: ContributionStatus) {
    if (status === "on-time") return { label: "On-time", icon: CheckCircle2, className: "text-[var(--status-paid)] bg-[var(--status-paid-bg)]" };
    if (status === "late") return { label: "Late", icon: Clock3, className: "text-[var(--status-late)] bg-[var(--status-late-bg)]" };
    return { label: "Missed", icon: XCircle, className: "text-[var(--status-missed)] bg-[var(--status-missed-bg)]" };
}

function ContributionRow({ record }: { record: ContributionRecord }) {
    const meta = statusMeta(record.status);
    const StatusIcon = meta.icon;
    return (
        <li className="relative flex gap-4 border-b border-[var(--ov-08)] px-4 py-5 last:border-0 sm:px-6">
            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--content)] ring-4 ring-[var(--modal)]">
                <StatusIcon size={17} className={meta.className.split(" ")[0]} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <Link href={`/dashboard/circles/${record.circleId}`} className="font-semibold text-[var(--text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]">
                            {record.circleName}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">Round {record.round} · Due {formatDate(record.dueDate)}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold tabular-nums text-[var(--text)]">{record.amount.toLocaleString()} USDT</p>
                        <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}>{meta.label}</span>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1"><CalendarDays size={13} aria-hidden="true" /> {record.status === "missed" ? "No payment recorded" : formatDate(record.date)}</span>
                    {record.transactionHash && <span className="font-mono">{record.transactionHash.slice(0, 10)}...{record.transactionHash.slice(-6)}</span>}
                    {record.transactionHash && (
                        <Link href={`/dashboard/contributions/receipt/${record.id}`} className="inline-flex items-center gap-1 text-[#4B6B76] hover:underline sm:ml-auto" aria-label={`View receipt for ${record.circleName} round ${record.round}`}>
                            <Receipt size={13} aria-hidden="true" /> View receipt
                        </Link>
                    )}
                    <Link href={`/dashboard/circles/${record.circleId}`} className={`inline-flex items-center gap-1 text-[#4B6B76] hover:underline ${record.transactionHash ? "" : "sm:ml-auto"}`}>View circle <ArrowUpRight size={13} aria-hidden="true" /></Link>
                </div>
            </div>
        </li>
    );
}

export default function ContributionsPage() {
    const [circleId, setCircleId] = useState("all");
    const [status, setStatus] = useState<"all" | ContributionStatus>("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const filteredRecords = useMemo(() => MOCK_CONTRIBUTIONS.filter((record) => {
        const recordDate = record.date || record.dueDate;
        return (circleId === "all" || record.circleId === circleId)
            && (status === "all" || record.status === status)
            && (!fromDate || recordDate >= fromDate)
            && (!toDate || recordDate <= toDate);
    }), [circleId, status, fromDate, toDate]);

    const listKey = `dashboard:contributions:${circleId}:${status}:${fromDate}:${toDate}`;
    const { visibleCount, hasMore, loadMore, sentinelRef, announcement } = useLoadMore(filteredRecords.length, listKey);
    const visibleRecords = filteredRecords.slice(0, visibleCount);
    const hasFilters = circleId !== "all" || status !== "all" || fromDate !== "" || toDate !== "";

    function updateFilter<T>(setter: (value: T) => void, value: T) {
        setter(value);
    }

    function clearFilters() {
        setCircleId("all");
        setStatus("all");
        setFromDate("");
        setToDate("");
    }

    const getExportRows = (): ExportRow[] => filteredRecords.map((record) => ({
        date: record.date ? formatDate(record.date) : `Missed · due ${formatDate(record.dueDate)}`,
        circleName: record.circleName,
        round: record.round,
        amount: `${record.amount} USDT`,
        type: record.status === "on-time" ? "Contribution (on-time)" : `Contribution (${record.status})`,
        transactionHash: record.transactionHash ?? "Not recorded",
    }));

    return (
        <div className="space-y-8 pb-20 md:pb-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <Link href="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"><ArrowLeft size={15} aria-hidden="true" /> Overview</Link>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Your contribution record</p>
                    <h1 className="mt-2 text-3xl font-bold font-sora text-[var(--text)]">Contribution history</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted2)]">Every contribution across your circles, organized by round and payment status.</p>
                </div>
                <ExportButton getRows={getExportRows} scope="contribution-history" prefix="contributions" title="Contribution history" disabled={filteredRecords.length === 0} />
            </div>

            <section className="rounded-2xl border border-[var(--ov-12)] bg-[var(--modal)] p-4 sm:p-5" aria-labelledby="history-filters-heading">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="history-filters-heading" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]"><Filter size={15} aria-hidden="true" /> Filter history</h2>
                    {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)]"><X size={14} aria-hidden="true" /> Clear filters</button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs text-[var(--muted)]">Circle<select value={circleId} onChange={(event) => updateFilter(setCircleId, event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]"><option value="all">All circles</option>{CONTRIBUTION_CIRCLE_OPTIONS.map((circle) => <option key={circle.id} value={circle.id}>{circle.name}</option>)}</select></label>
                    <label className="text-xs text-[var(--muted)]">Status<select value={status} onChange={(event) => updateFilter(setStatus, event.target.value as "all" | ContributionStatus)} className="mt-1.5 w-full rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]">{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                    <label className="text-xs text-[var(--muted)]">From date<input type="date" value={fromDate} onChange={(event) => updateFilter(setFromDate, event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]" /></label>
                    <label className="text-xs text-[var(--muted)]">To date<input type="date" value={toDate} onChange={(event) => updateFilter(setToDate, event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--ov-14)] bg-[var(--ov-05)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#4B6B76]" /></label>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[var(--ov-12)] bg-[var(--modal)]" aria-labelledby="timeline-heading">
                <div className="flex items-center justify-between border-b border-[var(--ov-08)] px-4 py-4 sm:px-6">
                    <div><h2 id="timeline-heading" className="text-lg font-semibold text-[var(--text)]">Timeline</h2><p className="mt-1 text-xs text-[var(--muted)]">{filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"} matching your filters</p></div>
                    <Download size={18} className="text-[var(--muted)]" aria-hidden="true" />
                </div>
                {visibleRecords.length > 0 ? <><ol className="relative">{visibleRecords.map((record) => <ContributionRow key={record.id} record={record} />)}</ol><div ref={sentinelRef} aria-hidden="true" className="h-px" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ov-08)] px-4 py-4 sm:px-6"><p className="text-xs text-[var(--muted)]" role="status" aria-live="polite">{announcement || `Showing ${visibleRecords.length} of ${filteredRecords.length} contributions`}</p>{hasMore ? <button type="button" onClick={loadMore} className="inline-flex items-center gap-2 rounded-lg bg-[#4B6B76] px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]">Load more<ChevronDown size={14} aria-hidden="true" /></button> : <span className="text-xs text-[var(--muted)]">All contributions loaded</span>}</div></> : <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ov-08)] text-[var(--muted)]"><CalendarDays size={24} aria-hidden="true" /></div><h2 className="text-lg font-semibold text-[var(--text)]">{MOCK_CONTRIBUTIONS.length === 0 ? "No contributions yet" : "No matching contributions"}</h2><p className="mt-2 max-w-md text-sm text-[var(--muted)]">{MOCK_CONTRIBUTIONS.length === 0 ? "Your contribution timeline will appear here after you make your first payment." : "Try changing the circle, date range, or status filters."}</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-lg border border-[var(--ov-14)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--ov-05)]">Clear filters</button>}</div>}
            </section>
        </div>
    );
}
