import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const steps = [
    "Upload Resume",
    "Upload or Paste Job Description",
    "Gemini Analysis",
    "Match Score",
    "ATS Score",
    "Skill Gap Analysis",
    "Recommendations"
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background text-text-primary selection:bg-accent selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col gap-8 max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-medium text-text-secondary w-fit">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI-Powered Resume ↔ Job Description Match Analyzer
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-text-primary">
              Analyze Your Resume Against Real Job Descriptions
            </h1>
            
            <p className="text-lg text-text-secondary leading-relaxed">
              Upload your resume, add a job description, and receive ATS scores, match scores, skill-gap analysis, and personalized recommendations powered by Gemini 2.5 Flash.
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <Link href="#cta" className="bg-text-primary text-background hover:bg-white/90 px-6 py-3 rounded-lg font-medium transition-colors">
                Get Started
              </Link>
              <Link href="#how-it-works" className="px-6 py-3 rounded-lg font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                View Workflow
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] animate-fade-in-delayed">
            {/* Dashboard Mockup */}
            <div className="absolute inset-0 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header bar */}
              <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-surface">
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-border" />
              </div>
              
              {/* Content */}
              <div className="p-8 flex flex-col gap-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="text-xs text-text-secondary mb-1">Resume Match</div>
                    <div className="text-3xl font-bold text-text-primary">82%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <div className="text-xs text-text-secondary mb-1">ATS Score</div>
                    <div className="text-3xl font-bold text-text-primary">78<span className="text-lg text-text-secondary">/100</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-background border border-border p-5">
                    <div className="text-sm font-medium mb-3 text-text-primary">Matching Skills</div>
                    <ul className="space-y-2">
                      {['React', 'Next.js', 'TypeScript'].map((skill, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="text-green-500">✓</span> {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="rounded-lg bg-background border border-border p-5">
                    <div className="text-sm font-medium mb-3 text-text-primary">Missing Skills</div>
                    <ul className="space-y-2">
                      {['Docker', 'AWS'].map((skill, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="text-red-500">✗</span> {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex-1 rounded-lg bg-background border border-border p-5 mt-2">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2 text-accent">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Recommendation
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Add cloud and containerization experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 relative border-t border-border/50 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border" />

            <div className="flex flex-col gap-8">
              {steps.map((step, index) => (
                <div key={index} className={`flex items-center w-full ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className="w-1/2 px-8 flex flex-col justify-center">
                    <div className={`p-6 rounded-xl bg-surface border border-border shadow-sm ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                      <h3 className="text-lg font-medium text-text-primary">{step}</h3>
                    </div>
                  </div>
                  
                  {/* Center Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-background border-2 border-border z-10">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-32 px-6 relative border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-10 tracking-tight">
            Ready to improve your chances of getting shortlisted?
          </h2>
          
          <button className="bg-text-primary text-background hover:bg-white/90 px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign In With Google
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
