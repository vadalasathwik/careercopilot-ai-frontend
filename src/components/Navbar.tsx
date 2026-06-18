import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            CareerCopilot <span className="text-accent">AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <Link href="#how-it-works" className="hover:text-text-primary transition-colors">
              How It Works
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="hidden md:block text-text-secondary hover:text-text-primary transition-colors">
            Login
          </Link>
          <Link href="#cta" className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
