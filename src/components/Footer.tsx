export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xl font-bold tracking-tight">
          CareerCopilot <span className="text-accent">AI</span>
        </div>
        
        <div className="text-sm text-text-secondary text-center">
          AI-powered Resume ↔ Job Description Match Analyzer
        </div>

        <div className="text-sm text-text-secondary">
          © {new Date().getFullYear()} CareerCopilot AI
        </div>
      </div>
    </footer>
  );
}
