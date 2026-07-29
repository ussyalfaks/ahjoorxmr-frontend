"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MessageCircle, ChevronDown } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";

type Category = "getting-started" | "contributions" | "payouts" | "wallet" | "troubleshooting";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: Category;
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    id: "gs-1",
    category: "getting-started",
    question: "What is Ahjoor?",
    answer:
      "Ahjoor is a blockchain-powered savings app that lets you save money together with friends, family, or community members using savings circles. Instead of trusting a middleman, smart contracts automate contributions, payouts, and ensure transparency for everyone in the circle.",
  },
  {
    id: "gs-2",
    category: "getting-started",
    question: "How do I get started?",
    answer:
      "Download the app, connect your wallet (Argent X or Braavos), and you're ready to go! You can either create a new circle or join an existing one. Just set the contribution amount, duration, and number of members, and the smart contract handles the rest.",
  },
  {
    id: "gs-3",
    category: "getting-started",
    question: "Do I need crypto experience?",
    answer:
      "No! While Ahjoor uses blockchain technology, we've designed it to be as simple as possible. You can use stablecoins (like USDT or USDC) which don't fluctuate in value, making it feel like using regular money.",
  },
  {
    id: "gs-4",
    category: "getting-started",
    question: "Which wallets are supported?",
    answer:
      "Currently, we support Argent X and Braavos wallets on Starknet. Both are free to download and easy to set up. We're working on expanding wallet support soon.",
  },
  {
    id: "gs-5",
    category: "getting-started",
    question: "Is Ahjoor safe to use?",
    answer:
      "Yes! All circles are managed by audited smart contracts. Your funds are never held by Ahjoor—they're controlled by code, not centralized servers. Everything is transparent and verifiable on-chain.",
  },

  // Contributions
  {
    id: "c-1",
    category: "contributions",
    question: "What is a contribution?",
    answer:
      "A contribution is your periodic payment into the circle. Every member contributes the same amount on a set schedule. Once all members have contributed in a round, the total pool is paid out to one member (determined by the rotation order).",
  },
  {
    id: "c-2",
    category: "contributions",
    question: "How often do I need to contribute?",
    answer:
      "The contribution frequency depends on how your circle is set up. It could be weekly, biweekly, or monthly. The frequency is decided when the circle is created and applies to all members equally.",
  },
  {
    id: "c-3",
    category: "contributions",
    question: "What happens if I miss a contribution?",
    answer:
      "Missing a contribution can have consequences set by the circle organizer. Typically, you'll be flagged as non-compliant or excluded from future payouts. The smart contract enforces these rules automatically to protect the circle.",
  },
  {
    id: "c-4",
    category: "contributions",
    question: "Can I change the contribution amount?",
    answer:
      "No, the contribution amount is fixed when the circle is created and cannot be changed mid-cycle. This ensures fairness and predictability for all members. You can propose a new circle with a different amount if needed.",
  },
  {
    id: "c-5",
    category: "contributions",
    question: "What currencies can we contribute in?",
    answer:
      "Ahjoor supports stablecoins like USDT, USDC, and other blockchain-based assets on Starknet. Using stablecoins means your savings won't lose value due to crypto volatility.",
  },

  // Payouts
  {
    id: "p-1",
    category: "payouts",
    question: "How are payouts decided?",
    answer:
      "Payouts follow a rotation order set when the circle is created. Each round, a different member receives the full pool of contributions from all members. This continues until everyone has received their turn.",
  },
  {
    id: "p-2",
    category: "payouts",
    question: "When do I receive my payout?",
    answer:
      "You receive your payout when it's your turn in the rotation and all members have contributed for that round. The smart contract automatically distributes the funds to your wallet on your payout date.",
  },
  {
    id: "p-3",
    category: "payouts",
    question: "What if someone doesn't contribute before my payout?",
    answer:
      "If a member hasn't contributed by the payout date, the smart contract will pause or adjust the payout based on the circle's rules. You can always check the circle details to see who is behind on payments.",
  },
  {
    id: "p-4",
    category: "payouts",
    question: "Can I claim my payout early?",
    answer:
      "No, payouts happen automatically on the scheduled date. This ensures fairness and prevents early withdrawals that could disrupt other members' turns. The fixed schedule is a core feature of savings circles.",
  },
  {
    id: "p-5",
    category: "payouts",
    question: "What are transaction fees?",
    answer:
      "Payouts involve blockchain transactions, which incur minimal network fees (gas fees). These are deducted from your payout and depend on network congestion. Ahjoor doesn't take a cut—fees go directly to the blockchain network.",
  },

  // Wallet
  {
    id: "w-1",
    category: "wallet",
    question: "What is a blockchain wallet?",
    answer:
      "A blockchain wallet is like a digital bank account that you control. It stores your cryptographic keys (your 'password') and lets you send and receive funds on the blockchain. You're in complete control—no bank or company can access your funds.",
  },
  {
    id: "w-2",
    category: "wallet",
    question: "How do I set up a wallet?",
    answer:
      "Download Argent X or Braavos from their official websites, follow the setup steps (you'll get a seed phrase to back up), and you're done! Your wallet will be connected to Starknet, and you can start using Ahjoor.",
  },
  {
    id: "w-3",
    category: "wallet",
    question: "What if I lose my seed phrase?",
    answer:
      "Your seed phrase is the only way to recover your wallet if you lose access. Store it securely (write it down, use a password manager, etc.). If you lose it, there's no way to recover your funds. Never share your seed phrase with anyone.",
  },
  {
    id: "w-4",
    category: "wallet",
    question: "How do I get stablecoins for contributions?",
    answer:
      "You can buy stablecoins like USDT or USDC on any cryptocurrency exchange (Binance, Coinbase, etc.) and transfer them to your Ahjoor wallet. Some exchanges also support direct transfers to Starknet for lower fees.",
  },
  {
    id: "w-5",
    category: "wallet",
    question: "Can I disconnect and reconnect my wallet?",
    answer:
      "Yes! You can disconnect your wallet anytime from the Wallet page. Your transaction history and circle memberships remain on-chain. Reconnect anytime with the same wallet address to resume activity.",
  },

  // Troubleshooting
  {
    id: "t-1",
    category: "troubleshooting",
    question: "Why is my contribution pending?",
    answer:
      "Blockchain transactions take time to confirm (usually 1-5 minutes). Your contribution will show as 'pending' until it's confirmed on the network. You can check its status by clicking the transaction hash to view it on the block explorer.",
  },
  {
    id: "t-2",
    category: "troubleshooting",
    question: "My payout didn't arrive. What do I do?",
    answer:
      "First, check the block explorer using the transaction hash from your wallet page. If it shows 'confirmed,' the funds should arrive in your wallet soon. If it shows 'failed,' contact support or check if there's an issue with the circle.",
  },
  {
    id: "t-3",
    category: "troubleshooting",
    question: "I'm getting an error when trying to contribute.",
    answer:
      "This could be due to insufficient balance, network issues, or wallet problems. Make sure you have enough stablecoins in your wallet to cover the contribution plus gas fees. Try disconnecting and reconnecting your wallet, or try again in a few minutes.",
  },
  {
    id: "t-4",
    category: "troubleshooting",
    question: "What if there's a dispute in my circle?",
    answer:
      "Ahjoor has a dispute resolution system for serious issues. Report the issue through the app's report feature and provide details. Our team will investigate and help resolve conflicts according to the circle's rules.",
  },
  {
    id: "t-5",
    category: "troubleshooting",
    question: "Can I leave a circle?",
    answer:
      "You cannot leave a circle mid-cycle as it would disrupt the rotation and fairness for other members. You can choose not to join future circles, but you must complete your current commitment.",
  },
];

const CATEGORIES: Record<Category, string> = {
  "getting-started": "Getting Started",
  contributions: "Contributions",
  payouts: "Payouts",
  wallet: "Wallet",
  troubleshooting: "Troubleshooting",
};

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  // Filter by category and search query
  const filteredFAQs = useMemo(() => {
    let filtered = FAQ_DATA;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Group by category
  const groupedFAQs = useMemo(() => {
    const grouped: Record<Category, FAQItem[]> = {
      "getting-started": [],
      contributions: [],
      payouts: [],
      wallet: [],
      troubleshooting: [],
    };

    filteredFAQs.forEach((item) => {
      grouped[item.category].push(item);
    });

    return grouped;
  }, [filteredFAQs]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--bg)] to-[var(--modal)] px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-sora mb-4">Help Center</h1>
          <p className="text-lg text-[var(--muted)] mb-8">
            Find answers to common questions about Ahjoor, savings circles, and getting started.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search help articles..."
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="max-w-4xl mx-auto flex gap-2 flex-wrap justify-center overflow-x-auto pb-4">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setExpandedId(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
              selectedCategory === "all"
                ? "bg-white text-black"
                : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            All Topics
          </button>
          {(Object.keys(CATEGORIES) as Category[]).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setExpandedId(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76] ${
                selectedCategory === category
                  ? "bg-white text-black"
                  : "bg-[var(--ov-0a)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {CATEGORIES[category]}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <Search size={48} className="text-[var(--muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">No results found</h2>
            <p className="text-[var(--muted)]">
              Try adjusting your search terms or browse all topics.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {(Object.keys(CATEGORIES) as Category[]).map((category) => {
              const categoryItems = groupedFAQs[category];
              if (categoryItems.length === 0) return null;

              return (
                <section key={category}>
                  <h2 className="text-2xl font-bold font-sora text-[var(--text)] mb-6 pb-3 border-b border-[var(--ov-0f)]">
                    {CATEGORIES[category]}
                  </h2>

                  <div className="space-y-3">
                    {categoryItems.map((item) => {
                      const isOpen = expandedId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="bg-[var(--content)] rounded-xl border border-[var(--ov-0f)] overflow-hidden transition-all duration-200"
                        >
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--modal)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
                            aria-expanded={isOpen}
                          >
                            <h3 className="font-semibold text-[var(--text)] leading-tight flex-1">
                              {item.question}
                            </h3>
                            <ChevronDown
                              size={20}
                              className={`text-[var(--muted)] shrink-0 transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-4 border-t border-[var(--ov-0f)]">
                              <p className="text-[var(--muted)] leading-relaxed">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Still Need Help Section */}
        <div className="mt-16 pt-12 border-t border-[var(--ov-0f)]">
          <div className="bg-gradient-to-r from-[#6c5ce7] to-[#8b7cf8] rounded-2xl p-8 md:p-12 text-center text-white">
            <MessageCircle size={40} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold font-sora mb-3">Still need help?</h2>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              Join our Telegram community to chat with other Ahjoor users and get support from our team.
            </p>
            <a
              href="https://t.me/ahjoor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#6c5ce7] rounded-lg font-semibold hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageCircle size={18} />
              Join Telegram Community
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ov-0a)] text-[var(--text)] rounded-lg font-medium hover:bg-[var(--ov-1a)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
