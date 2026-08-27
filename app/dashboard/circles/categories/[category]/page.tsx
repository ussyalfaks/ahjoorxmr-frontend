"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, DollarSign, Users } from "lucide-react";
import JoinCircleModal, { type JoinCircleData } from "@/components/modals/JoinCircleModal";
import {
  CATEGORY_LABELS,
  CIRCLE_CATEGORIES,
  mockCircles,
  type CircleCategory,
} from "@/lib/circles";

const CURRENT_WALLET = "0x23g43gdaa8f2c5b1e9d0f7a34bc6e12d8a9f5c3b";

function isCircleCategory(value: string): value is CircleCategory {
  return CIRCLE_CATEGORIES.includes(value as CircleCategory);
}

export default function CircleCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryParam } = use(params);
  const category = categoryParam.toLowerCase();
  const [joinCircle, setJoinCircle] = useState<JoinCircleData | null>(null);
  const circles = isCircleCategory(category)
    ? mockCircles.filter((circle) => circle.category === category && circle.status === "active")
    : [];
  const label = isCircleCategory(category) ? CATEGORY_LABELS[category] : "Category";

  return (
    <div className="max-w-5xl space-y-8 pb-20 md:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/circles?tab=discover"
          className="rounded text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          aria-label="Back to Discover"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Discover circles</p>
          <h1 className="mt-1 text-2xl font-bold font-sora text-[var(--text)]">{label}</h1>
        </div>
        <span className="ml-auto rounded-full bg-[#4B6B76]/15 px-3 py-1 text-xs font-medium text-[#4B6B76]">
          {circles.length} active
        </span>
      </div>

      {circles.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--ov-14)] bg-[var(--content)] px-6 py-24 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ov-0a)] text-2xl" aria-hidden="true">
            {isCircleCategory(category) ? "○" : "?"}
          </div>
          <h2 className="text-lg font-bold font-sora text-[var(--text)]">No active {label.toLowerCase()} circles yet</h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            New circles in this category will appear here when they open for members.
          </p>
          <Link
            href="/dashboard/circles?tab=discover"
            className="mt-6 rounded-lg bg-[#4B6B76] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Browse all circles
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {circles.map((circle) => (
            <article key={circle.id} className="flex flex-col gap-4 rounded-2xl bg-[var(--content)] p-6">
              <div>
                <Link href={`/dashboard/circles/${circle.id}`} className="hover:underline">
                  <h2 className="text-lg font-bold font-sora text-[var(--text)]">{circle.name}</h2>
                </Link>
                <p className="mt-1 truncate font-mono text-xs text-[var(--muted)]">by {circle.creator}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="mb-1.5 text-xs text-[var(--muted)]">Members</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
                    <Users size={14} className="text-[var(--muted)]" aria-hidden="true" />
                    {circle.members.length}/{circle.totalSlots}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-[var(--muted)]">Contribution</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
                    <DollarSign size={14} className="text-[var(--muted)]" aria-hidden="true" />
                    {circle.contribution}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-[var(--muted)]">Duration</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text)]">
                    <Clock size={14} className="text-[var(--muted)]" aria-hidden="true" />
                    {circle.duration}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setJoinCircle(circle)}
                className="mt-auto rounded-lg bg-[#4B6B76] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3D5A64] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                Join Circle
              </button>
            </article>
          ))}
        </div>
      )}

      <JoinCircleModal
        open={joinCircle !== null}
        onClose={() => setJoinCircle(null)}
        circle={joinCircle}
        currentWallet={CURRENT_WALLET}
      />
    </div>
  );
}
