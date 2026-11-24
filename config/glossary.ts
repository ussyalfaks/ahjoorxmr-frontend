/**
 * Plain-language explanations of Web3/blockchain terms, rendered inline via
 * <GlossaryTerm term="..." />. To add a term, add an entry here — the key
 * becomes the `term` prop value and is type-checked everywhere it's used.
 */
export interface GlossaryEntry {
  /** Display label used when <GlossaryTerm> has no children. */
  term: string;
  /** One or two short sentences, written for non-crypto-native users. */
  definition: string;
  /** Optional link for users who want to read more. */
  learnMoreHref?: string;
}

export const GLOSSARY = {
  "gas-fee": {
    term: "Gas fee",
    definition:
      "A small fee paid to the blockchain network to process your transaction. It goes to the network, not to Ahjoor, and changes with how busy the network is.",
  },
  "network-fee": {
    term: "Network fee",
    definition:
      "Another name for the gas fee: the cost of having the network record your transaction. Your wallet shows the final amount before you approve.",
  },
  wallet: {
    term: "Wallet",
    definition:
      "An app (like Argent X or Braavos) that holds your funds and lets you approve transactions. Ahjoor never holds your keys or moves funds without your approval.",
  },
  "wallet-address": {
    term: "Wallet address",
    definition:
      "Your public account number on the blockchain (it starts with 0x). It's safe to share so people can send you funds.",
  },
  "wallet-signature": {
    term: "Wallet signature",
    definition:
      "Your approval of an action, given inside your wallet app. Signing proves the request came from you — never sign something you don't recognise.",
  },
  "block-confirmation": {
    term: "Block confirmation",
    definition:
      "Transactions are grouped into blocks. Once your transaction is included in a block it's confirmed, which usually takes a few seconds to a minute.",
  },
  "transaction-hash": {
    term: "Transaction hash",
    definition:
      "A unique ID for your transaction. You can paste it into a block explorer to see its status and details publicly.",
  },
  "block-explorer": {
    term: "Block explorer",
    definition:
      "A public website (such as Starkscan) that shows every transaction on the blockchain. Use it to verify that a payment went through.",
  },
  starknet: {
    term: "Starknet",
    definition:
      "The blockchain network Ahjoor runs on. It keeps fees low while inheriting Ethereum's security.",
  },
  stablecoin: {
    term: "Stablecoin",
    definition:
      "A digital token designed to keep a steady value, usually 1 US dollar. USDT and USDC are stablecoins.",
  },
  "smart-contract": {
    term: "Smart contract",
    definition:
      "Code that lives on the blockchain and runs automatically. Ahjoor circles use smart contracts to hold contributions and release payouts by the agreed rules.",
  },
  passkey: {
    term: "Passkey",
    definition:
      "A password-free sign-in using your device's fingerprint, face or screen lock. Nothing secret leaves your device.",
  },
  payout: {
    term: "Payout",
    definition:
      "The pooled contributions a member receives when it's their turn in the circle's rotation.",
  },
  "off-ramp": {
    term: "Off-ramp",
    definition:
      "A service that converts crypto into regular money and sends it to your bank account. Partners may charge a conversion fee.",
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryTermId = keyof typeof GLOSSARY;

export function getGlossaryEntry(id: GlossaryTermId): GlossaryEntry {
  return GLOSSARY[id];
}
