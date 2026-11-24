export interface Testimonial {
  id: string;
  name: string;
  role: string;
  circleContext?: string;
  quote: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Amara O.",
    role: "Circle Founder",
    circleContext: "Family Savings Circle",
    quote: "Ahjoor transformed how our family manages savings. No more confusion about who paid what - everything is transparent on-chain.",
    avatar: "AO",
  },
  {
    id: "2",
    name: "Kwame A.",
    role: "Community Organizer",
    circleContext: "Village Cooperative",
    quote: "We raised $12,000 for our community project in 6 months. The auto-payouts meant everyone received their funds exactly when promised.",
    avatar: "KA",
  },
  {
    id: "3",
    name: "Sarah M.",
    role: "Circle Member",
    circleContext: "Wedding Fund Circle",
    quote: "I never thought saving could be this painless. The notifications remind me before each contribution, and I always know my balance.",
    avatar: "SM",
  },
  {
    id: "4",
    name: "David K.",
    role: "Circle Member",
    circleContext: "Business Startup Circle",
    quote: "As a group of entrepreneurs, we needed trust. Ahjoor's smart contracts handled everything - no need to trust any single person.",
    avatar: "DK",
  },
  {
    id: "5",
    name: "Fatima H.",
    role: "Circle Founder",
    circleContext: "Diaspora Savings",
    quote: "Being abroad, I couldn't participate in local circles before. Now I can save with my family back home seamlessly.",
    avatar: "FH",
  },
  {
    id: "6",
    name: "Michael T.",
    role: "Financial Advisor",
    circleContext: "Professional Network Circle",
    quote: "I've recommended Ahjoor to dozens of clients. The combination of transparency and automation is exactly what informal savings groups need.",
    avatar: "MT",
  },
];