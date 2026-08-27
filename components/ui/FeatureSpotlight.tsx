"use client";

import { useState, useRef, useEffect } from "react";
import { useFeatureSpotlight } from "@/hooks/useFeatureSpotlight";
import { X, Sparkles } from "lucide-react";

interface Props {
  featureId: string;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}

export default function FeatureSpotlight({ featureId, children, align = "center" }: Props) {
  const { showSpotlight, feature, dismiss } = useFeatureSpotlight(featureId);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatically open on first render if showing
  useEffect(() => {
    if (showSpotlight) {
      // Small delay to ensure smooth entry
      const t = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [showSpotlight]);

  // Click outside to close (but not dismiss)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!showSpotlight || !feature) {
    return <>{children}</>;
  }

  let alignClass = "left-1/2 -translate-x-1/2";
  let arrowClass = "left-1/2 -translate-x-1/2";
  
  if (align === "left") {
    alignClass = "left-0";
    arrowClass = "left-6";
  } else if (align === "right") {
    alignClass = "right-0";
    arrowClass = "right-6";
  }

  return (
    <div className="relative inline-block w-full sm:w-auto" ref={containerRef}>
      <div 
        className="relative z-0 inline-block w-full sm:w-auto" 
      >
        <div>
          {children}
        </div>
        
        {/* Pulsing Dot */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 right-4 sm:-top-1 sm:-right-1 sm:translate-y-0 z-10 w-3 h-3 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#4B6B76] opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4B6B76] border border-[var(--background)]"></span>
        </div>
      </div>

      {/* Tooltip Popover */}
      {isOpen && (
        <div 
          className={`absolute top-full mt-3 z-50 w-[280px] bg-[var(--content)] border border-[#4B6B76]/30 shadow-xl rounded-xl p-4 origin-top transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${alignClass}`}
        >
          <div className={`absolute -top-2 w-4 h-4 rotate-45 bg-[var(--content)] border-l border-t border-[#4B6B76]/30 ${arrowClass}`} />
          
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold font-sora text-[var(--text)]">
                <Sparkles size={16} className="text-[#4B6B76]" />
                {feature.title}
              </h4>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Close tooltip"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {feature.description}
            </p>
            <div className="mt-2 flex justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(); setIsOpen(false); }}
                className="px-4 py-2 bg-[#4B6B76] text-white text-xs font-semibold rounded-lg hover:bg-[#3A535C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B6B76]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
