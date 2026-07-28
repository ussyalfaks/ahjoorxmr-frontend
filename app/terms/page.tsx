import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Ahjoor",
  description:
    "The terms governing use of Ahjoor's decentralized savings circles.",
};

const LAST_UPDATED = "July 28, 2026";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    paragraphs: [
      "By accessing or using Ahjoor, you agree to be bound by these Terms of Service and any policies referenced within them. If you do not agree with any part of these terms, you should not use the platform.",
      "You must be of legal age in your jurisdiction to enter into a binding agreement in order to use Ahjoor. You are responsible for ensuring that your use of the platform is lawful where you live.",
    ],
  },
  {
    id: "responsibilities",
    title: "2. User Responsibilities",
    paragraphs: [
      "You are solely responsible for the security of your wallet, private keys, and seed phrases. Ahjoor never takes custody of your credentials and cannot recover them on your behalf. Anyone with access to your keys can move your funds.",
      "When you join a savings circle, you commit to contributing the agreed amount on the agreed schedule. Missing contributions may affect your standing in a circle and may be visible to other participants.",
      "You agree not to use Ahjoor for unlawful purposes, including money laundering, sanctions evasion, or financing prohibited activity, and not to interfere with the platform's normal operation.",
    ],
  },
  {
    id: "on-chain",
    title: "3. On-Chain Transaction Disclaimer",
    paragraphs: [
      "Ahjoor coordinates savings circles using smart contracts on a public blockchain. Transactions submitted to the blockchain are final and irreversible. Once a transaction is confirmed, neither Ahjoor nor any other party can reverse, cancel, or refund it.",
      "Blockchain networks may experience congestion, elevated fees, reorganizations, or downtime that delay or prevent transactions from settling. Smart contracts may contain undiscovered defects. You accept these risks when you transact.",
      "Any figures shown in the interface — balances, payout schedules, projected returns — are estimates derived from on-chain data and may lag the true state of the network. The blockchain is the authoritative record.",
    ],
  },
  {
    id: "liability",
    title: "4. Limitation of Liability",
    paragraphs: [
      "Ahjoor is provided on an “as is” and “as available” basis, without warranties of any kind, whether express or implied. We do not warrant that the platform will be uninterrupted, secure, or error-free.",
      "To the fullest extent permitted by law, Ahjoor and its contributors shall not be liable for any indirect, incidental, special, consequential, or exemplary damages, including loss of funds, profits, or data, arising from your use of the platform.",
      "Ahjoor does not provide financial, investment, tax, or legal advice. You are responsible for evaluating the risks of participating in a savings circle and for meeting any tax obligations that arise from your activity.",
    ],
  },
  {
    id: "changes",
    title: "5. Changes to Terms",
    paragraphs: [
      "We may update these terms from time to time. When we do, we will revise the “last updated” date at the top of this page and, where changes are material, provide notice through the platform.",
      "Your continued use of Ahjoor after revised terms take effect constitutes acceptance of those terms. If you do not agree to the changes, you should stop using the platform.",
    ],
  },
  {
    id: "contact",
    title: "6. Contact",
    paragraphs: [
      "Questions about these terms can be directed to the project maintainers through the repository or the community channels linked in the site footer.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-[720px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#7878a0] no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7] rounded"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="mt-8 font-['Sora'] text-[32px] font-bold tracking-[-0.5px] text-[#eeeef8] md:text-[40px]">
          Terms of Service
        </h1>
        <p className="mt-3 text-[14px] text-[#7878a0]">
          Last updated: <time dateTime="2026-07-28">{LAST_UPDATED}</time>
        </p>

        <div
          className="mt-8 flex gap-3 rounded-[14px] border border-[#FBBF2433] bg-[#FBBF2410] p-4"
          role="note"
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-[#FBBF24]"
            aria-hidden="true"
          />
          <p className="text-[13px] leading-relaxed text-[#c4bbff]">
            <strong className="font-semibold text-[#FBBF24]">
              Placeholder copy.
            </strong>{" "}
            This document is a structural draft written for development purposes
            and has not been reviewed by a lawyer. It is not legally binding and
            must be replaced with counsel-approved language before launch.
          </p>
        </div>

        <nav aria-label="Table of contents" className="mt-10">
          <h2 className="font-['Sora'] text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7878a0]">
            On this page
          </h2>
          <ul className="mt-3 list-none space-y-1.5 p-0">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[14px] text-[#a0a0c0] no-underline transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7] rounded"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 space-y-11">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-8">
              <h2 className="font-['Sora'] text-[20px] font-bold tracking-[-0.2px] text-[#eeeef8] md:text-[22px]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((text, i) => (
                  <p
                    key={i}
                    className="text-[15px] leading-[1.75] text-[#a0a0c0]"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <hr className="mt-14 border-t border-white/[0.07]" />
        <p className="mt-6 text-[13px] text-[#7878a0]">
          © {new Date().getFullYear()} Ahjoor. Continued use of the platform
          constitutes acceptance of these terms.
        </p>
      </div>
    </main>
  );
}
