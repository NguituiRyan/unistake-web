import { Mail, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950/50 mt-12 py-8">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left Side: Branding & Copyright */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-lg font-bold tracking-tight text-white">
              Uni<span className="text-neon-blue">Stake</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} UniStake. Built for Strathmore University.
          </p>
        </div>

        {/* Right Side: Contact Channels */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-sm font-medium text-zinc-400 mb-2 sm:mb-0">
            Need Help?
          </span>
          
          <div className="flex gap-3">
            {/* Official Email */}
            <a 
              href="mailto:unistake@gmail.com"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
              title="Email Support"
            >
              <Mail className="h-4 w-4" />
              <span className="text-xs font-medium">Email</span>
            </a>

            {/* Official WhatsApp Business */}
            <a 
              href="https://wa.me/254733333147?text=Hi%20UniStake%20Support,"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-green-500 hover:bg-green-500/10 hover:border-green-500/50 transition-colors"
              title="WhatsApp Support"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">WhatsApp</span>
            </a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}