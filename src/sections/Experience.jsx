const experiences = [
  {
    period: "August 2025 — February 2026",
    role: "SDE Intern",
    company: "Dataline Advertisers",
    description:
      "Developed 10+ production-grade REST and WebSocket APIs using Python and FastAPI, powering an enterprise AI voice-calling platform. Designed a custom RAG pipeline using OpenAI embeddings and Firestore vector database, improving search accuracy by 40%. Orchestrated asynchronous webhook handlers and event-driven call state management, ensuring 99.9% API uptime.",
    technologies: ["Python", "FastAPI", "OpenAI", "RAG", "Firestore", "WebSockets"],
    current: true,
  },
];

export const Experience = () => {
  return (
    <section id="experience" className="py-32 relative overflow-hidden bg-background">
      {/* Subtle background glow */}
      <div
        className="absolute top-1/2 left-1/4 w-96
        h-96 bg-primary opacity-5 rounded-full blur-[128px] -translate-y-1/2 pointer-events-none"
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span
            className="text-primary text-sm
            font-medium tracking-wider uppercase animate-fade-in"
          >
            Professional Experience
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold
            mt-4 mb-6 animate-fade-in animation-delay-100
             text-foreground"
          >
            Work that{" "}
            <span className="font-serif italic font-normal text-white">
              drives innovation.
            </span>
          </h2>

          <p
            className="text-muted-foreground
            animate-fade-in animation-delay-200"
          >
            My professional journey in the tech industry, focusing on high-performance 
            backend systems and cutting-edge AI integration.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/30 to-transparent md:-translate-x-1/2 opacity-70" />

          {/* Experience Items */}
          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="relative grid md:grid-cols-2 gap-8 animate-fade-in"
                style={{ animationDelay: `${(idx + 1) * 150}ms` }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 md:left-1/2 top-0 w-3 h-3 bg-primary rounded-full -translate-x-1/2 ring-4 ring-background z-10">
                  {exp.current && (
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                  )}
                </div>

                {/* Content Logic (Alternating sides on Desktop) */}
                <div
                  className={`pl-8 md:pl-0 ${
                    idx % 2 === 0
                      ? "md:pr-16 md:text-right"
                      : "md:col-start-2 md:pl-16"
                  }`}
                >
                  <div
                    className="glass p-6 rounded-2xl border border-primary border-opacity-30 hover:border-opacity-50 transition-all duration-500"
                  >
                    <span className="text-sm text-primary font-medium">
                      {exp.period}
                    </span>
                    <h3 className="text-xl font-semibold mt-2 text-foreground">{exp.role}</h3>
                    <p className="text-muted-foreground font-medium">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                      {exp.description}
                    </p>
                    
                    {/* Tech Badges */}
                    <div
                      className={`flex flex-wrap gap-2 mt-4 ${
                        idx % 2 === 0 ? "md:justify-end" : ""
                      }`}
                    >
                      {exp.technologies.map((tech, techIdx) => (
                        <span
                          key={techIdx}
                          className="px-3 py-1 bg-surface text-[10px] uppercase tracking-wider rounded-full text-muted-foreground border border-white border-opacity-5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
