"use client";

import { FileText, Download } from "lucide-react";
import { downloadCircleAgreementPdf, type CircleAgreementData } from "@/lib/circleAgreement";

interface DownloadAgreementButtonProps {
  data: CircleAgreementData;
  className?: string;
}

export function DownloadAgreementButton({ data, className = "" }: DownloadAgreementButtonProps) {
  const handleDownload = () => {
    const filename = `circle-agreement-${data.circle.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    downloadCircleAgreementPdf(data, filename);
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--hover)] ${className}`}
      title="Download circle agreement summary"
    >
      <FileText className="h-4 w-4" />
      Download Agreement
    </button>
  );
}