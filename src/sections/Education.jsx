import { GraduationCap, Trophy, Award, Star, Code2 } from "lucide-react";

const achievements = [
  {
    title: "LeetCode Knight",
    value: "Top 4%",
    description: "Achieved Knight rank globally with a focus on advanced data structures and algorithms.",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    title: "Problem Solving",
    value: "1000+",
    description: "Solved across platforms including LeetCode, CodeChef, GeeksforGeeks, and Codeforces.",
    icon: Code2,
    color: "text-blue-500",
  },
  {
    title: "Global Rank 172",
    value: "Top 0.6%",
    description: "Achieved in CodeChef Starters 86 (Division 4) among thousands of participants.",
    icon: Star,
    color: "text-purple-500",
  },
];

export const EducationAndAchievements = () => {
  return (
    <section id="education" className="py-32 relative overflow-hidden bg-background">
      {/* Background Decor - Updated for v3 opacity/blur */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary opacity-5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Education */}
          <div className="lg:col-span-5 space-y-8">
            <div className="animate-fade-in">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Academic Foundation
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 text-foreground">
                Education
              </h2>
            </div>

            <div className="glass p-8 rounded-3xl border border-primary border-opacity-20 relative group overflow-hidden animate-fade-in animation-delay-100">
              {/* Background Icon Decor */}
              <div className="absolute top-0 right-0 p-4 text-primary opacity-5 group-hover:opacity-10 transition-opacity">
                <GraduationCap size={80} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
                    <GraduationCap className="text-primary" />
                  </div>
                  <span className="text-primary font-medium">2022 — 2026</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  Indian Institute of Information Technology, Nagpur
                </h3>
                <p className="text-lg text-muted-foreground mb-4">
                  Bachelor of Technology in ECE
                </p>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Focusing on core Computer Science fundamentals, Signal Processing, 
                  and Embedded Systems while maintaining a strong focus on 
                  Software Engineering.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Achievements */}
          <div className="lg:col-span-7 space-y-8">
            <div className="animate-fade-in">
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Milestones
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 text-foreground">
                Achievements
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {achievements.map((item, idx) => (
                <div 
                  key={idx}
                  className={`glass p-6 rounded-2xl border border-white border-opacity-5 hover:border-primary hover:border-opacity-30 transition-all duration-300 group animate-fade-in ${
                    idx === 0 ? "sm:col-span-2" : ""
                  }`}
                  style={{ animationDelay: `${(idx + 2) * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{item.value}</span>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-tight">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Specialized Badge for Competitive Programming */}
              <div className="sm:col-span-2 glass p-6 rounded-2xl border border-dashed border-primary border-opacity-40 flex items-center justify-between bg-primary bg-opacity-5 animate-fade-in animation-delay-500">
                <div className="flex items-center gap-4">
                  <Award className="text-primary w-8 h-8" />
                  <div>
                    <p className="text-white font-semibold">Consistent Performer</p>
                    <p className="text-xs text-muted-foreground">Maintained high ratings across CodeChef & LeetCode contests.</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-surface flex items-center justify-center">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};