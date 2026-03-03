import { ArrowUpRight, Github } from "lucide-react";
import { AnimatedBorderButton } from "@/components/AnimatedBorderButton";

const projects = [
  {
    title: "ZapAI - AI SaaS Platform",
    description:
      "A full-stack PERN platform featuring AI article generation, resume analysis, and image processing (Background/Object removal). Includes Clerk authentication and premium subscription gating.",
    image: "/projects/zapai.png", 
    tags: ["PERN Stack", "Gemini AI", "Clerk Auth", "Neon DB", "Cloudinary", "Stripe"],
    link: "https://zap-ai.vercel.app",
    github: "https://github.com/sundram7865/zapai",
  },
  {
    title: "Doclino CMS",
    description:
      "A medical management system with role-based access for patients, doctors, and admins. Features appointment booking, availability toggles, and dual payment integration with Razorpay and Stripe.",
    image: "/projects/doclino.png",
    tags: ["MongoDB", "Express", "React", "Node.js", "Razorpay", "Cloudinary"],
    link: "#",
    github: "https://github.com/sundram7865/CMS",
  },
  {
    title: "Microservices Chat Platform",
    description:
      "Architected a real-time chat system using a microservices pattern. Implemented event-driven communication via RabbitMQ and used Redis caching to reduce database load by 70%.",
    image: "/projects/chat-app.png",
    tags: ["TypeScript", "RabbitMQ", "Redis", "Docker", "AWS", "WebSockets"],
    link: "#",
    github: "https://github.com/sundram7865",
  },
  {
    title: "MetroNova Real Estate",
    description:
      "A robust real estate backend infrastructure. Implemented PostGIS for geospatial property searches and RBAC-based authentication to manage complex user permissions.",
    image: "/projects/metronova.png",
    tags: ["Next.js", "Prisma", "PostgreSQL", "PostGIS", "AWS S3"],
    link: "https://metro-nova.vercel.app/",
    github: "https://github.com/sundram7865",
  },
];

export const Projects = () => {
  return (
    <section id="projects" className="py-32 relative overflow-hidden bg-background">
      {/* Background glows - Updated to v3 opacity */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-highlight opacity-5 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mx-auto max-w-3xl mb-16">
          <span className="text-primary text-sm font-medium tracking-wider uppercase animate-fade-in">
            Featured Work
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 animate-fade-in animation-delay-100 text-foreground">
            Projects that{" "}
            <span className="font-serif italic font-normal text-white">
              make an impact.
            </span>
          </h2>
          <p className="text-muted-foreground animate-fade-in animation-delay-200">
            A selection of my recent work, focusing on scalable backend architectures, 
            intelligent AI integrations, and complex system designs.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="group glass rounded-2xl overflow-hidden animate-fade-in border border-white border-opacity-5 hover:border-primary hover:border-opacity-20 transition-all duration-500"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay Gradient - Updated v3 opacity */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                
                {/* Hover Overlay Links */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full glass hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full glass hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Content Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <ArrowUpRight
                    className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                  />
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {project.description}
                </p>
                
                {/* Tech Tags - Updated v3 opacity */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="px-3 py-1 rounded-full bg-primary bg-opacity-5 text-[10px] font-medium border border-primary border-opacity-10 text-primary transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12 animate-fade-in animation-delay-500">
          <a href="https://github.com/sundram7865" target="_blank" rel="noopener noreferrer">
            <AnimatedBorderButton>
              <span className="flex items-center gap-2">
                View All Projects on GitHub
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </AnimatedBorderButton>
          </a>
        </div>
      </div>
    </section>
  );
};