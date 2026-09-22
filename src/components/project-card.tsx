import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { GithubMark, Pill } from "@/components/ui";
import type { Project } from "@/content/types";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const headingId = `project-${project.slug}`;

  return (
    <article
      aria-labelledby={headingId}
      className="group relative rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:p-6"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-xs text-fg-subtle">{String(index + 1).padStart(2, "0")}</span>
        <h3 id={headingId} className="text-lg font-semibold tracking-tight text-fg">
          {/* Whole-card target for pointers; the link text stays the accessible name. */}
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 hover:text-accent">
            {project.name}
          </Link>
        </h3>
        <span className="font-mono text-xs text-fg-subtle">{project.role}</span>
      </div>

      <p className="mt-1 text-sm text-accent">{project.tagline}</p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">{project.summary}</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {project.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="sr-only">{metric.label}</dt>
            <dd>
              <span className="block font-mono text-base font-semibold text-fg">{metric.value}</span>
              <span className="mt-0.5 block text-xs leading-snug text-fg-subtle">{metric.label}</span>
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.slice(0, 7).map((item) => (
          <li key={item}>
            <Pill>{item}</Pill>
          </li>
        ))}
      </ul>

      {/* Sits above the card-wide link so these remain independently clickable. */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
        <Link
          href={`/work/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fg hover:text-accent"
        >
          Read the case study
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {project.live ? (
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-accent"
          >
            Live
            <ArrowUpRight aria-hidden className="size-3.5" />
            <span className="sr-only"> — {project.name} (opens in a new tab)</span>
          </a>
        ) : null}

        {project.repo ? (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-accent"
          >
            <GithubMark className="size-3.5" />
            Source
            <span className="sr-only"> — {project.name} on GitHub (opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
