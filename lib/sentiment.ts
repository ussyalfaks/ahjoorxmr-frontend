export type ReviewSentiment = "positive" | "negative" | "neutral";

export interface SentimentResult {
    label: ReviewSentiment;
    score: number;
}

const POSITIVE_TERMS: Record<string, number> = {
    amazing: 2,
    exactly: 1,
    seamlessly: 1,
    transparent: 1,
    trust: 1,
    painless: 2,
    promised: 1,
    recommend: 2,
    recommended: 2,
    success: 2,
    transformed: 2,
    always: 1,
    clarity: 1,
};

const NEGATIVE_TERMS: Record<string, number> = {
    confused: 2,
    confusion: 2,
    failed: 2,
    frustrating: 2,
    frustrated: 2,
    poor: 2,
    problem: 1,
    problems: 1,
    issue: 1,
    issues: 1,
    difficult: 1,
    late: 1,
    short: 1,
};

export function analyzeSentiment(text: string): SentimentResult {
    const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
    const score = words.reduce(
        (total, word) => total + (POSITIVE_TERMS[word] ?? 0) - (NEGATIVE_TERMS[word] ?? 0),
        0
    );

    return {
        score,
        label: score > 0 ? "positive" : score < 0 ? "negative" : "neutral",
    };
}

export function findNegativeSentimentSpikes(
    reviews: Array<{ project: string; sentiment: ReviewSentiment }>,
    minimumReviews = 2
): string[] {
    const groups = new Map<string, { total: number; negative: number }>();

    for (const review of reviews) {
        const group = groups.get(review.project) ?? { total: 0, negative: 0 };
        group.total += 1;
        if (review.sentiment === "negative") group.negative += 1;
        groups.set(review.project, group);
    }

    return [...groups.entries()]
        .filter(([, group]) => group.total >= minimumReviews && group.negative / group.total >= 0.5)
        .map(([project]) => project);
}