"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials, Testimonial } from "@/data/testimonials";
import { analyzeSentiment, findNegativeSentimentSpikes, type ReviewSentiment } from "@/lib/sentiment";

type ReviewedTestimonial = Testimonial & ReturnType<typeof analyzeSentiment>;

const SENTIMENT_STYLES: Record<ReviewSentiment, string> = {
  positive: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  negative: "bg-red-500/10 text-red-500 border-red-500/20",
  neutral: "bg-slate-500/10 text-[var(--muted)] border-[var(--border)]",
};

function SentimentBadge({ sentiment }: { sentiment: ReviewSentiment }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${SENTIMENT_STYLES[sentiment]}`}>
      {sentiment}
    </span>
  );
}

function TestimonialCard({ testimonial, isActive }: { testimonial: ReviewedTestimonial; isActive: boolean }) {
  return (
    <div
      className={`flex-shrink-0 w-full md:w-[400px] lg:w-[450px] p-6 md:p-8 rounded-[20px] bg-[var(--card)] border border-[var(--border)] transition-all duration-300 ${isActive
        ? "opacity-100 scale-100 translate-x-0"
        : "opacity-0 scale-95 absolute pointer-events-none"
        }`}
      role="group"
      aria-roledescription="carousel"
      aria-label={`Testimonial by ${testimonial.name}`}
    >
      {/* Quote Icon */}
      <div className="mb-5 w-10 h-10 rounded-[12px] bg-[var(--accent-soft)] flex items-center justify-center">
        <Quote size={20} className="text-[var(--accent)]" aria-hidden="true" />
      </div>

      {/* Quote Text */}
      <div className="mb-3"><SentimentBadge sentiment={testimonial.label} /></div>
      <blockquote className="text-[15px] leading-[1.7] text-[var(--muted)] mb-6">
        &quot;{testimonial.quote}&quot;
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white font-bold text-sm"
          aria-hidden="true"
        >
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-[var(--text)] text-[15px] font-sora">
            {testimonial.name}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {testimonial.role}
            {testimonial.circleContext && (
              <>
                <span className="mx-1.5">•</span>
                {testimonial.circleContext}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentimentFilter, setSentimentFilter] = useState<ReviewSentiment | "all">("all");
  const reviewedTestimonials = testimonials.map((testimonial) => ({
    ...testimonial,
    ...analyzeSentiment(testimonial.quote),
  }));
  const visibleTestimonials = reviewedTestimonials.filter(
    (testimonial) => sentimentFilter === "all" || testimonial.label === sentimentFilter
  );
  const visibleCount = visibleTestimonials.length;
  const negativeSpikes = findNegativeSentimentSpikes(
    reviewedTestimonials.map((testimonial) => ({
      project: testimonial.circleContext ?? "Unassigned project",
      sentiment: testimonial.label,
    }))
  );

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(visibleCount - 1, 0) : prev - 1));
  }, [visibleCount]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === visibleCount - 1 ? 0 : prev + 1));
  }, [visibleCount]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <section id="testimonials" className="px-6 py-24 text-center">
      <div className="max-w-[1100px] mx-auto">
        <p className="text-[11px] tracking-[3.5px] uppercase text-[#8b7cf8] mb-3 font-medium">
          Success Stories
        </p>
        <h2 className="font-['Sora'] font-extrabold tracking-[-0.8px] text-[var(--text)] mb-[14px] text-[clamp(28px,4vw,42px)]">
          What Our Users Say
        </h2>
        <p className="text-[var(--muted)] text-[16px] max-w-[500px] mx-auto mb-12">
          Join thousands of members who have transformed their savings journey with Ahjoor.
        </p>

        {negativeSpikes.length > 0 && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-500" role="alert">
            Negative sentiment spike detected for: {negativeSpikes.join(", ")}. Review the latest feedback.
          </div>
        )}

        <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter reviews by sentiment">
          {(["all", "positive", "neutral", "negative"] as const).map((filter) => {
            const count = filter === "all"
              ? reviewedTestimonials.length
              : reviewedTestimonials.filter((testimonial) => testimonial.label === filter).length;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setSentimentFilter(filter);
                  setCurrentIndex(0);
                }}
                aria-pressed={sentimentFilter === filter}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${sentimentFilter === filter ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"}`}
              >
                {filter} ({count})
              </button>
            );
          })}
        </div>

        {/* Carousel Container */}
        <div className="relative mb-8">
          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-6 md:p-7 rounded-[20px] bg-[var(--card)] border border-[var(--border)] text-left hover:border-[var(--border-hover)] transition-all duration-250 hover:-translate-y-1"
              >
                <div className="mb-4 w-9 h-9 rounded-[10px] bg-[var(--accent-soft)] flex items-center justify-center">
                  <Quote size={18} className="text-[var(--accent)]" aria-hidden="true" />
                </div>
                <div className="mb-3"><SentimentBadge sentiment={testimonial.label} /></div>
                <blockquote className="text-[14px] leading-[1.65] text-[var(--muted)] mb-5">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text)] text-sm font-sora">
                      {testimonial.name}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {testimonial.role}
                      {testimonial.circleContext && (
                        <>
                          <span className="mx-1">•</span>
                          {testimonial.circleContext}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden relative overflow-hidden">
            <div className="relative h-[320px] flex items-center justify-center mx-4">
              {visibleTestimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  isActive={index === currentIndex}
                />
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Testimonial navigation">
              {visibleTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  role="tab"
                  aria-selected={index === currentIndex}
                  aria-label={`Go to testimonial ${index + 1}`}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex
                    ? "w-6 bg-[var(--accent)]"
                    : "bg-[var(--ov-1a)] hover:bg-[var(--ov-14)]"
                    }`}
                />
              ))}
            </div>

            {/* Arrow Buttons */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-hover)] transition-all shadow-md"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-hover)] transition-all shadow-md"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Tablet: Navigation Dots (optional) */}
        <div className="hidden md:flex lg:hidden justify-center gap-2 mt-6" role="tablist" aria-label="Testimonial navigation">
          {testimonials.slice(0, 4).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to testimonial ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex
                ? "w-6 bg-[var(--accent)]"
                : "bg-[var(--ov-1a)] hover:bg-[var(--ov-14)]"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}