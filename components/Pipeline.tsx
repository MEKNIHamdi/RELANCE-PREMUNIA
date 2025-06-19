"use client"

import type * as React from "react"
import { CheckCircle2, CircleDotDashed, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A single step in the pipeline.
 */
export interface PipelineStep {
  /** Unique identifier for React keys */
  id: string
  /** What will be shown next to the icon */
  label: string
  /** Current status of the step */
  status: "pending" | "running" | "success" | "failed"
}

/**
 * Props for the Pipeline component.
 *
 * @param steps  Array of pipeline steps to render.
 * @param inline If true, render steps horizontally; otherwise vertically.
 */
export interface PipelineProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: PipelineStep[]
  inline?: boolean
}

/**
 * Pipeline – renders a list of steps with status icons.
 *
 * Example:
 * <Pipeline
 *   steps={[
 *     { id: '1', label: 'Install',  status: 'success' },
 *     { id: '2', label: 'Build',    status: 'running' },
 *     { id: '3', label: 'Deploy',   status: 'pending' },
 *   ]}
 * />
 */
export function Pipeline({ steps, inline = false, className, ...props }: PipelineProps) {
  /** Returns the correct icon for a status */
  const renderIcon = (status: PipelineStep["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="size-5 shrink-0 text-green-600" aria-label="Completed" />
      case "running":
        return <Loader2 className="size-5 shrink-0 animate-spin text-blue-600" aria-label="Running" />
      case "failed":
        return <XCircle className="size-5 shrink-0 text-red-600" aria-label="Failed" />
      case "pending":
      default:
        return <CircleDotDashed className="size-5 shrink-0 text-muted-foreground" aria-label="Pending" />
    }
  }

  return (
    <div className={cn("flex", inline ? "flex-row items-center gap-4" : "flex-col gap-2", className)} {...props}>
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          {renderIcon(step.status)}
          <span className="text-sm font-medium">{step.label}</span>
          {/* Add connecting line for vertical layout, except last item */}
          {!inline && i < steps.length - 1 && <div aria-hidden="true" className="ml-2 flex-1 border-t border-border" />}
        </div>
      ))}
    </div>
  )
}

export default Pipeline
