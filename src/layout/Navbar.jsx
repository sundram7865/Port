import { Button } from "@/components/Button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 transition-all duration-500 z-50 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg border-b border-white/5 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <nav className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          Sundram's Portfolio<span className="text-primary"></span>
        </a>

        {/* Desktop Nav - Floating Pill Style */}
        <div className="hidden md:flex items-center gap-1">
          <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-full px-2 py-1 flex items-center gap-1">
            {navLinks.map((link, index) => (
              <a
                href={link.href}
                key={index}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-full hover:bg-white/5 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <a href="#contact">
            <Button size="sm" className="rounded-full px-6">
              Contact Me
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground focus:outline-none"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 top-[60px] bg-background md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
          {navLinks.map((link, index) => (
            <a
              href={link.href}
              key={index}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-white/5" />
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="w-full py-6 text-lg">
              Get in Touch
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};