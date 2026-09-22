import { site, socials } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-sm text-fg">{site.name}</p>
          <p className="text-sm text-fg-muted">
            {site.role} · {site.location}
          </p>
        </div>

        <nav aria-label="Social and contact" className="flex flex-wrap gap-x-5 gap-y-2">
          {socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              className="text-sm text-fg-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <p className="font-mono text-xs text-fg-subtle">
          Built with Next.js and TypeScript. Source at{" "}
          <a
            href="https://github.com/sundram7865/Port"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-accent"
          >
            github.com/sundram7865/Port
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
