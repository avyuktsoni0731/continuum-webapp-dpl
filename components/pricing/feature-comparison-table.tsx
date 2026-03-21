"use client";

import { Fragment } from "react";
import Image from "next/image";
import { Check, Minus } from "lucide-react";
import {
  FEATURE_MATRIX,
  type FeatureCategory,
  type FeatureItem,
  type FeatureValue,
} from "@/lib/pricing-data";
import { cn } from "@/lib/utils";

function opsTaglineFromName(name: string): string {
  const parts = name.split(/\s—\s/);
  return parts.length > 1 ? parts.slice(1).join(" — ") : name;
}

function FeatureNameCell({ item }: { item: FeatureItem }) {
  if (item.nameVariant === "ops-logo") {
    const tagline = opsTaglineFromName(item.name);
    return (
      <div
        className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1 min-w-0"
        aria-label={item.name}
      >
        <Image
          src="/Continuum_Ops_Logo.png"
          alt=""
          width={1080}
          height={1080}
          className="h-[18px] sm:h-5 w-auto max-w-[min(8rem,32vw)] object-contain object-left shrink-0 opacity-95"
        />
        <span className="text-s font-medium text-cyan-100/75 leading-snug max-w-[18rem]">
          {tagline}
        </span>
      </div>
    );
  }
  return <>{item.name}</>;
}

function CellValue({
  value,
  tone = "default",
}: {
  value: FeatureValue;
  tone?: "default" | "ops";
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={cn(
          "w-5 h-5",
          tone === "ops" ? "text-cyan-200/85" : "text-white/60"
        )}
        aria-label="Included"
      />
    ) : (
      <Minus
        className={cn(
          "w-5 h-5",
          tone === "ops" ? "text-muted-foreground/30" : "text-muted-foreground/40"
        )}
        aria-label="Not included"
      />
    );
  }
  return (
    <span
      className={cn(
        "text-sm font-medium",
        value === "Roadmap" && "text-muted-foreground italic",
        value === "Unlimited" || value === "Custom" ? "text-white" : "",
        tone === "ops" &&
        value !== "Roadmap" &&
        value !== "Unlimited" &&
        value !== "Custom" &&
        "text-cyan-100/85"
      )}
    >
      {value}
    </span>
  );
}

/** Unified row + cell styling for Continuum Ops highlight block */
function opsHighlightRowClasses(column: "feature" | "tier" | "pro") {
  return cn(
    column === "feature" &&
    "border-l-2 border-l-cyan-400/45 bg-cyan-950/30 pl-4 text-foreground/95",
    column === "tier" && "bg-cyan-950/25",
    column === "pro" && "bg-accent/6"
  );
}

export function FeatureComparisonTable() {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[800px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 pr-6 font-medium text-muted-foreground text-sm">
                Feature
              </th>
              <th className="text-center py-4 px-4 font-serif font-medium min-w-[100px]">
                Free
              </th>
              <th className="text-center py-4 px-4 font-serif font-medium min-w-[100px]">
                Starter
              </th>
              <th className="text-center py-4 px-4 font-serif font-medium min-w-[100px] bg-accent/5">
                Pro
              </th>
              <th className="text-center py-4 px-4 font-serif font-medium min-w-[100px]">
                Enterprise
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_MATRIX.map((section, sectionIdx) => (
              <Fragment key={`section-${section.category}-${sectionIdx}`}>
                <OpsSectionRows section={section} sectionIdx={sectionIdx} />
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpsSectionRows({
  section,
  sectionIdx,
}: {
  section: FeatureCategory;
  sectionIdx: number;
}) {
  const isOpsHighlight = section.variant === "ops-highlight";

  return (
    <>
      {/* Section title — skip for Continuum Ops (logo row carries the label) */}
      {!isOpsHighlight ? (
        <tr className="border-b border-border/50">
          <td
            colSpan={5}
            className="py-3 pt-6 font-medium text-foreground/90 uppercase tracking-wider text-xs"
          >
            {section.category}
          </td>
        </tr>
      ) : null}

      {section.items.map((item, itemIdx) => {
        const isOpsRow = item.rowAccent === "ops";

        if (isOpsHighlight) {
          return (
            <tr
              key={`${sectionIdx}-${itemIdx}-${item.name}`}
              className={cn(
                "border-b border-cyan-500/15 transition-colors hover:bg-cyan-950/20",
                itemIdx === 0 && "border-t border-border/50"
              )}
            >
              <td
                className={cn(
                  "py-3.5 pr-6 text-sm",
                  itemIdx === 0 && "pt-4",
                  opsHighlightRowClasses("feature")
                )}
              >
                <FeatureNameCell item={item} />
              </td>
              <td
                className={cn(
                  "py-3.5 px-4 text-center",
                  itemIdx === 0 && "pt-8",
                  opsHighlightRowClasses("tier")
                )}
              >
                <div className="flex justify-center">
                  <CellValue value={item.free} tone="ops" />
                </div>
              </td>
              <td
                className={cn(
                  "py-3.5 px-4 text-center",
                  itemIdx === 0 && "pt-8",
                  opsHighlightRowClasses("tier")
                )}
              >
                <div className="flex justify-center">
                  <CellValue value={item.starter} tone="ops" />
                </div>
              </td>
              <td
                className={cn(
                  "py-3.5 px-4 text-center",
                  itemIdx === 0 && "pt-8",
                  opsHighlightRowClasses("pro")
                )}
              >
                <div className="flex justify-center">
                  <CellValue value={item.pro} tone="ops" />
                </div>
              </td>
              <td
                className={cn(
                  "py-3.5 px-4 text-center",
                  itemIdx === 0 && "pt-8",
                  opsHighlightRowClasses("tier")
                )}
              >
                <div className="flex justify-center">
                  <CellValue value={item.enterprise} tone="ops" />
                </div>
              </td>
            </tr>
          );
        }

        return (
          <tr
            key={`${sectionIdx}-${itemIdx}-${item.name}`}
            className={cn(
              "border-b border-border/30 transition-colors",
              isOpsRow
                ? "bg-cyan-500/6 hover:bg-cyan-500/10"
                : "hover:bg-card/30"
            )}
          >
            <td
              className={cn(
                "py-3 pr-6 text-sm text-muted-foreground",
                isOpsRow &&
                "border-l-2 border-l-cyan-500/50 bg-cyan-500/5 pl-3 text-cyan-50/95"
              )}
            >
              <FeatureNameCell item={item} />
            </td>
            <td
              className={cn("py-3 px-4 text-center", isOpsRow && "bg-cyan-500/5")}
            >
              <div className="flex justify-center">
                <CellValue value={item.free} />
              </div>
            </td>
            <td
              className={cn("py-3 px-4 text-center", isOpsRow && "bg-cyan-500/5")}
            >
              <div className="flex justify-center">
                <CellValue value={item.starter} />
              </div>
            </td>
            <td
              className={cn(
                "py-3 px-4 text-center",
                isOpsRow ? "bg-cyan-500/10" : "bg-accent/5"
              )}
            >
              <div className="flex justify-center">
                <CellValue value={item.pro} />
              </div>
            </td>
            <td
              className={cn("py-3 px-4 text-center", isOpsRow && "bg-cyan-500/5")}
            >
              <div className="flex justify-center">
                <CellValue value={item.enterprise} />
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
