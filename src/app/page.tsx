import { ArrowUpRight, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ArchitectureExplorer } from "@/components/architecture/explorer";
import { ProjectCard } from "@/components/project-card";
import { ButtonLink, GithubMark, MetricBlock, Pill, Section, SectionHeading } from "@/components/ui";
import { notes } from "@/content/notes";
import { projects, secondaryProjects } from "@/content/projects";
import { achievements, education, experience, headlineMetrics, site, skills } from "@/content/site";

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="grid-backdrop border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {site.role} · {site.location}
          </p>

          <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-fg sm:text-5xl">
            I build systems where being wrong is expensive.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            Founding engineer at{" "}
            <a
              href="https://shramiksathi.com/"
              target="_blank"
              rel="noreferrer"
              className="text-fg underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              Shramik Sathi
            </a>
            , where a payroll run that breaks the law is a liability, not a bug report. Before that,
            LLM observability and agentic AI platforms. The interesting problem there is
            not the model, but everything you build around it to contain the model being wrong.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#work">See the work</ButtonLink>
            <ButtonLink href={site.resume} variant="secondary" external>
              Résumé (PDF)
            </ButtonLink>
          </div>

          <dl className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {headlineMetrics.map((metric) => (
              <div key={metric.label}>
                <dt className="sr-only">{metric.label}</dt>
                <dd>
                  <MetricBlock value={metric.value} label={metric.label} detail={metric.detail} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------------- 3D explorer */}
      <Section id="systems" labelledBy="systems-heading">
        <SectionHeading
          id="systems-heading"
          eyebrow="Architecture"
          title="The three systems, as they actually run"
          lede="Not illustrations. These are the real topologies, with the components I chose and the reasons they are there. Drag to orbit, or pick a component from the list."
        />
        <ArchitectureExplorer />
      </Section>

      {/* -------------------------------------------------------------- Work */}
      <Section id="work" labelledBy="work-heading">
        <SectionHeading
          id="work-heading"
          eyebrow="Selected work"
          title="Three systems, explained properly"
          lede="Each of these is written up as a case study: the problem, the constraints I was actually working under, what I chose, what that cost, and what I would do differently."
        />

        <div className="mt-10 space-y-5">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- Experience */}
      <Section id="experience" labelledBy="experience-heading">
        <SectionHeading id="experience-heading" eyebrow="Experience" title="Where I have worked" />

        <ol className="mt-10 space-y-10">
          {experience.map((role) => (
            <li key={role.company} className="border-l border-border pl-5 sm:pl-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-lg font-semibold tracking-tight text-fg">
                  {role.href ? (
                    <a href={role.href} target="_blank" rel="noreferrer" className="hover:text-accent">
                      {role.company}
                      <ArrowUpRight aria-hidden className="ml-1 inline size-3.5 align-baseline" />
                    </a>
                  ) : (
                    role.company
                  )}
                </h3>
                {role.current ? (
                  <span className="rounded-full border border-accent/40 bg-accent-wash px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                    Current
                  </span>
                ) : null}
              </div>

              <p className="mt-1 font-mono text-xs text-fg-subtle">
                {role.role} · {role.period} · {role.location}
              </p>

              <ul className="mt-4 space-y-2.5">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="text-sm leading-relaxed text-fg-muted">
                    {bullet}
                  </li>
                ))}
              </ul>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {role.stack.map((item) => (
                  <li key={item}>
                    <Pill>{item}</Pill>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------------------------ Writing */}
      <Section id="notes" labelledBy="notes-heading">
        <SectionHeading
          id="notes-heading"
          eyebrow="Writing"
          title="Decisions, with their costs attached"
          lede="Short notes on choices I made in production, including the parts that did not work out the way I expected."
        />

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {notes.map((note) => (
            <li key={note.slug}>
              <Link href={`/notes/${note.slug}`} className="group block py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-base font-semibold tracking-tight text-fg group-hover:text-accent">
                    {note.title}
                  </h3>
                  <span className="font-mono text-xs text-fg-subtle">
                    {note.context} · {note.readingTime}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">{note.dek}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ----------------------------------------------------------- Also built */}
      <Section id="other" labelledBy="other-heading">
        <SectionHeading
          id="other-heading"
          eyebrow="Also built"
          title="Earlier projects"
          lede="Listed for completeness rather than argued for. The three above are the ones worth your time."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {secondaryProjects.map((project) => (
            <li key={project.name} className="rounded-xl border border-border bg-surface p-5">
              <h3 className="text-base font-semibold tracking-tight text-fg">{project.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{project.summary}</p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <li key={item}>
                    <Pill>{item}</Pill>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {project.live ? (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-accent"
                  >
                    Live
                    <ArrowUpRight aria-hidden className="size-3.5" />
                    <span className="sr-only">: {project.name} (opens in a new tab)</span>
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
                    <span className="sr-only">: {project.name} on GitHub (opens in a new tab)</span>
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* -------------------------------------------------------------- About */}
      <Section id="about" labelledBy="about-heading">
        {/* Weighted towards the prose column: the portrait takes ~200px out of
            it, and an even split left the bio wrapping at ~45 characters. */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div>
            <SectionHeading id="about-heading" eyebrow="About" title="How I work" />

            <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
              {/* Intrinsic dimensions are the source file's, so the box is
                  reserved before the image decodes and nothing shifts. */}
              <Image
                src="/sundram-mishra.jpg"
                alt="Sundram Mishra"
                width={760}
                height={1056}
                sizes="(max-width: 640px) 160px, 208px"
                className="h-auto w-40 shrink-0 rounded-xl border border-border object-cover sm:w-52"
              />

              <div className="space-y-4 text-base leading-[1.75] text-fg-muted">
                <p>
                  I work on backends where correctness has consequences outside the software:
                  payroll that has to satisfy a labour inspector, an agent that can move money, a
                  tracing pipeline whose own overhead changes what it measures.
                </p>
                <p>
                  The pattern in all three is the same: assume the interesting failure is the one
                  that does not raise an error. A payroll run that is quietly illegal, a trace that
                  is quietly incomplete, an agent that was quietly talked into something. Most of
                  the engineering I am proud of is the machinery that makes those failures loud, or
                  impossible.
                </p>
                <p>
                  I am finishing a B.Tech at IIIT Nagpur and working remotely as a founding
                  engineer. My competitive programming background is the reason I reach for the
                  boring, provable solution first.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-border bg-surface p-5">
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Education</h3>
              <p className="mt-3 text-sm font-semibold text-fg">{education.institution}</p>
              <p className="mt-1 text-sm text-fg-muted">{education.degree}</p>
              <p className="mt-1 font-mono text-xs text-fg-subtle">
                {education.period} · {education.location}
              </p>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-3">
              {achievements.map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd>
                    <MetricBlock value={item.value} label={item.label} detail={item.detail} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Stack</h3>
            <dl className="mt-6 space-y-6">
              {skills.map((group) => (
                <div key={group.label}>
                  <dt className="text-sm font-medium text-fg">{group.label}</dt>
                  <dd className="mt-2.5">
                    <ul className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <li key={item}>
                          <Pill>{item}</Pill>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Contact */}
      <Section id="contact" labelledBy="contact-heading">
        <SectionHeading
          id="contact-heading"
          eyebrow="Contact"
          title="Open to backend and distributed systems roles"
          lede="Email is the fastest way to reach me. I read everything, and I will reply even if it is not a fit."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`mailto:${site.email}`} external>
            <Mail aria-hidden className="size-4" />
            {site.email}
          </ButtonLink>
          <ButtonLink href="https://linkedin.com/in/sundram1mishra" variant="secondary" external>
            LinkedIn
          </ButtonLink>
          <ButtonLink href="https://github.com/sundram7865" variant="secondary" external>
            GitHub
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
