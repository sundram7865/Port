import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { noteBySlug, notes } from "@/content/notes";
import { site } from "@/content/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const note = noteBySlug(slug);
  if (!note) return {};

  return {
    title: note.title,
    description: note.dek,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      type: "article",
      title: `${note.title} | ${site.name}`,
      description: note.dek,
      url: `/notes/${note.slug}`,
    },
  };
}

export default async function NotePage({ params }: Params) {
  const { slug } = await params;
  const note = noteBySlug(slug);
  if (!note) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <Link
        href="/#notes"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-fg-muted hover:text-accent"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        All writing
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs text-fg-subtle">
          {note.context} · {note.readingTime}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
          {note.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-fg-muted">{note.dek}</p>
      </header>

      <div className="mt-12 border-t border-border pt-10">
        {note.body.map((section) => (
          <section key={section.heading} className="mt-10 first:mt-0">
            <h2 className="text-base font-semibold tracking-tight text-fg">{section.heading}</h2>
            <div className="mt-3 space-y-3.5">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-[1.75] text-fg-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <nav aria-label="Other notes" className="mt-16 border-t border-border pt-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-fg-subtle">More writing</p>
        <ul className="mt-4 space-y-2">
          {notes
            .filter((other) => other.slug !== note.slug)
            .map((other) => (
              <li key={other.slug}>
                <Link href={`/notes/${other.slug}`} className="text-sm font-medium text-fg hover:text-accent">
                  {other.title}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </article>
  );
}
