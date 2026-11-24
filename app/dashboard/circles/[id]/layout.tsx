import type { Metadata } from "next";
import { MOCK_CIRCLES } from "@/data/circles";

/**
 * Server layout for circle detail routes. The page itself is a client
 * component, so share metadata (Open Graph / Twitter card) lives here.
 * The images come from the sibling opengraph-image / twitter-image files.
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const circle = MOCK_CIRCLES.find((c) => c.id === id);

  const title = circle ? `${circle.name} — Ahjoor` : "Savings circle — Ahjoor";
  const description = circle
    ? `Join ${circle.name}: ${circle.contribution} every ${circle.duration.toLowerCase()}, ${circle.members.length}/${circle.totalSlots} members joined.`
    : "Decentralized savings circles powered by blockchain.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function CircleDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
