/**
 * Receipt layout — intentionally bare.
 * Strips the dashboard sidebar, header, and bottom nav so the receipt page
 * renders cleanly both on screen and when printed / saved as PDF.
 * The root app layout (Providers, Toaster, etc.) still wraps this.
 */
export default function ReceiptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // receipt-root is targeted by the @media print rules in global.css
    <div className="receipt-root min-h-screen bg-white text-gray-900">
      {children}
    </div>
  );
}
