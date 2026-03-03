import { Code2, Cpu, Zap, BrainCircuit } from "lucide-react";

const highlights = [
  {
    icon: BrainCircuit,
    title: "Agentic AI & RAG",
    description:
      "Architecting intelligent systems using LLMs, OpenAI Realtime, and vector-based retrieval (RAG).",
  },
  {
    icon: Cpu,
    title: "System Design",
    description:
      "Designing scalable microservices, event-driven architectures with RabbitMQ, and Redis caching.",
  },
  {
    icon: Code2,
    title: "Backend Excellence",
    description: "Building production-grade APIs with FastAPI and Node.js with a focus on low latency.",
  },
  {
    icon: Zap,
    title: "Problem Solving",
    description:
      "LeetCode Knight (Top 4.4% globally) with 1000+ problems solved across major platforms.",
  },
];

export const About = () => {
  return (
    <section id="about" className="py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Narrative */}
          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                About Me
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in animation-delay-100 text-foreground">
              Engineering intelligence,
              <br />
              <span className="font-serif italic font-normal text-white">
                architecting scale.
              </span>
            </h2>

            <div className="space-y-4 text-muted-foreground animate-fade-in animation-delay-200">
              <p>
                I am a Software Development Engineer with a deep obsession for 
                backend systems and the evolving world of Agentic AI. My work 
                revolves around bridging the gap between complex infrastructure 
                and intelligent user experiences.
              </p>
              <p>
                From building sub-500ms latency AI voice agents using Twilio 
                and OpenAI to architecting microservices with RabbitMQ and 
                PostgreSQL, I thrive on solving high-impact technical challenges. 
                My approach to System Design is rooted in my competitive 
                programming background, where efficiency and logic are paramount.
              </p>
              <p>
                I specialize in the PERN stack and FastAPI, with a heavy 
                focus on Database Design (PostGIS, Firestore) and RAG pipelines. 
                I don't just build features; I design systems that are secure, 
                asynchronous, and ready to scale.
              </p>
            </div>

            {/* Custom Glass Card for Quote */}
            <div className="glass rounded-2xl p-6 glow-border animate-fade-in animation-delay-300">
              <p className="text-lg font-medium italic text-foreground">
                "My goal is to build autonomous, AI-driven systems that are 
                as robust in their architecture as they are intelligent in 
                their execution."
              </p>
            </div>
          </div>

          {/* Right Column - Highlights Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                {/* Icon Container with v3 compatible opacity */}
                <div className="w-12 h-12 rounded-xl bg-primary bg-opacity-10 flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};