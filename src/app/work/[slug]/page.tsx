import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink, GithubMark, Pill } from "@/components/ui";
import { projectBySlug, projects } from "@/content/projects";
import { site } from "@/content/site";
import type { CaseStudySection } from "@/content/types";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.name}: ${project.tagline}`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.name} | ${site.name}`,
      description: project.summary,
      url: `/work/${project.slug}`,
    },
  };
}

function Block({ section }: { section: CaseStudySection }) {
  return (
    <section className="mt-8 first:mt-0">
      <h3 className="text-base font-semibold tracking-tight text-fg">{section.heading}</h3>
      <div className="mt-3 space-y-3.5">
        {section.body.map((paragraph) => (
          <p key={paragraph} className="text-[15px] leading-[1.75] text-fg-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function Heading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
      {children}
    </h2>
  );
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-fg-muted hover:text-accent"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        All work
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs text-fg-subtle">
          {project.role} · {project.period}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
          {project.name}
        </h1>
        <p className="mt-3 text-lg leading-snug text-accent">{project.tagline}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.live ? (
            <ButtonLink href={project.live} external>
              Visit live site
              <ArrowUpRight aria-hidden className="size-4" />
            </ButtonLink>
          ) : null}
          {project.repo ? (
            <ButtonLink href={project.repo} variant="secondary" external>
              <GithubMark className="size-4" />
              Source
            </ButtonLink>
          ) : null}
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-6 sm:grid-cols-4">
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-xs leading-snug text-fg-subtle">{metric.label}</dt>
              <dd className="mt-1 font-mono text-xl font-semibold text-fg">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <li key={item}>
              <Pill>{item}</Pill>
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-14">
        <Heading id="problem">The problem</Heading>
        <div className="mt-4 space-y-3.5">
          {project.problem.map((paragraph) => (
            <p key={paragraph} className="text-[15px] leading-[1.75] text-fg-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <Heading id="constraints">Constraints</Heading>
        <ul className="mt-4 space-y-3">
          {project.constraints.map((constraint) => (
            <li
              key={constraint}
              className="border-l-2 border-border pl-4 text-[15px] leading-[1.75] text-fg-muted"
            >
              {constraint}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14">
        <Heading id="approach">Approach</Heading>
        <div className="mt-4">
          {project.approach.map((section) => (
            <Block key={section.heading} section={section} />
          ))}
        </div>
      </div>

      <div className="mt-14">
        <Heading id="tradeoffs">Trade-offs</Heading>
        <div className="mt-4">
          {project.tradeoffs.map((section) => (
            <Block key={section.heading} section={section} />
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <Heading id="retro">What I would do differently</Heading>
        <ul className="mt-4 space-y-4">
          {project.retrospective.map((item) => (
            <li key={item} className="text-[15px] leading-[1.75] text-fg-muted">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14">
        <Heading id="impact">Impact</Heading>
        <ul className="mt-4 space-y-2.5">
          {project.impact.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-[1.75] text-fg-muted">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label="Other case studies" className="mt-16 border-t border-border pt-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle">Other work</p>
        <ul className="mt-4 space-y-2">
          {projects
            .filter((other) => other.slug !== project.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/work/${other.slug}`}
                  className="group flex items-baseline gap-3 text-sm text-fg-muted hover:text-accent"
                >
                  <span className="font-medium text-fg group-hover:text-accent">{other.name}</span>
                  <span className="truncate">{other.tagline}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </article>
  );
}
