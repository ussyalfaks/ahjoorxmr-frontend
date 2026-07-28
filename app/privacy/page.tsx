import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Ahjoor",
  description: "How Ahjoor handles wallet addresses, on-chain activity, and optional profile information.",
};

const LAST_UPDATED = "July 28, 2026";

const sections = [
  {
    title: "Data We Collect",
    body: [
      "Ahjoor is a non-custodial, decentralized savings application. We collect the minimum data needed to operate the product:",
      "Wallet addresses you connect to the app, on-chain transaction activity related to circles you join or create, and optional profile information you choose to provide (such as a display name or avatar).",
      "We do not collect private keys, seed phrases, or custodial control over your funds at any point.",
    ],
  },
  {
    title: "On-Chain vs Off-Chain Data",
    body: [
      "On-chain data — contributions, payouts, circle membership, and transaction hashes — is recorded permanently on the Starknet blockchain and is publicly visible to anyone, independent of Ahjoor.",
      "Off-chain data — such as your display name, notification preferences, or theme settings — is stored by Ahjoor to improve your experience and can be deleted on request.",
    ],
  },
  {
    title: "Cookies & Local Storage",
    body: [
      "Ahjoor uses browser local storage to remember preferences such as theme (light/dark) and onboarding state. We do not use third-party advertising cookies or tracking pixels.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "We may rely on third-party infrastructure providers (e.g. wallet providers, RPC/node providers, and analytics services) to operate the app. These providers have their own privacy practices, and we encourage you to review them.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have questions about this policy or how your data is handled, reach out to us at privacy@ahjoor.app.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors no-underline"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold font-sora tracking-tight text-[var(--text)]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {LAST_UPDATED}</p>

        <div className="mt-4 rounded-xl border border-[var(--ov-14)] bg-[var(--ov-05)] px-4 py-3 text-sm text-[var(--muted)]">
          This is placeholder legal copy pending formal legal review. It is structured to reflect
          how Ahjoor actually handles data, but should not be treated as final legal language.
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold font-sora text-[var(--text)] mb-3">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-[var(--muted2)]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
