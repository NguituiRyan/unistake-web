import { ShieldAlert, HeartHandshake, Scale, Mail, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Footer() {
  const currentYear = new Date().getFullYear(); // Will automatically show 2026!

  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-8 mt-auto">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* TOP ROW: Logo, Status, and Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          
          {/* Logo & Status */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <img 
              src="/logo.png" 
              alt="UniStake Logo" 
              className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
            />
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
              Beta v0.1 • Strathmore Exclusive
            </span>
          </div>

          {/* Legal & Support Links (Using Dialogs for popups!) */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-zinc-400">
            
            {/* TERMS OF SERVICE MODAL */}
            <Dialog>
              <DialogTrigger className="hover:text-neon-blue transition-colors flex items-center gap-1.5">
                <Scale className="h-4 w-4" /> Terms of Service
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-300 sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl flex items-center gap-2">
                    <Scale className="h-5 w-5 text-neon-blue" /> Terms of Service
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm leading-relaxed mt-2">
                  <p>By accessing UniStake, you verify that you are 18 years of age or older and an active student.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-white">Staking & Limits:</strong> The maximum allowable stake per individual market is KES 150,000.</li>
                    <li><strong className="text-white">Platform Fees:</strong> To maintain the servers and platform, UniStake applies a 5% house fee exclusively on the <em>losing pool</em> of resolved markets. This fee is completely waived for smaller markets with a total volume under KES 1,000.</li>
                    <li><strong className="text-white">Refunds:</strong> In the event of a unanimous market (where 100% of traders bet on the same outcome), all stakes are automatically refunded with zero fees.</li>
                    <li><strong className="text-white">Disputes:</strong> Market outcomes are resolved based on real-world verifiable data. Any disputes regarding a market resolution must be submitted to support within 72 hours of the market closing.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>

            {/* PRIVACY POLICY MODAL */}
            <Dialog>
              <DialogTrigger className="hover:text-neon-blue transition-colors flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Privacy Policy
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-300 sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-neon-blue" /> Privacy Policy
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm leading-relaxed mt-2">
                  <p>UniStake is built by students, for students. To maintain platform integrity, we securely store your <code className="bg-zinc-900 text-neon-blue px-1 py-0.5 rounded">@strathmore.edu</code> email address, basic profile details, and your betting ledger.</p>
                  <p className="text-white font-medium border-l-2 border-neon-blue pl-3 py-1 bg-neon-blue/5">
                    We deeply respect your privacy. Your data, market positions, and transaction history are strictly confidential and will absolutely never be shared with Strathmore University administration or external third parties.
                  </p>
                  <p>All M-Pesa deposit and withdrawal details are tokenized and processed exclusively via our secure, licensed payment provider.</p>
                </div>
              </DialogContent>
            </Dialog>

            {/* SUPPORT LINK */}
            <a 
              href="mailto:unistake.contact@gmail.com" 
              className="hover:text-neon-blue transition-colors flex items-center gap-1.5"
            >
              <Mail className="h-4 w-4" /> Support
            </a>
          </div>
        </div>

        <div className="border-t border-zinc-800/50 pt-8 flex flex-col items-center gap-6">
          
          {/* RESPONSIBLE GAMING NOTICE */}
          <div className="w-full max-w-3xl bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
              <HeartHandshake className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-1 flex items-center justify-center sm:justify-start gap-2">
                Play Smart <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Betting should be fun, not stressful. Set your own limits. If you or a friend needs help with gambling, please contact the <strong className="text-zinc-300">Kenya Red Cross (1199)</strong> or <strong className="text-zinc-300">Gamblers Anonymous Kenya</strong>.
              </p>
            </div>
          </div>

          {/* COPYRIGHT & DISCLAIMER */}
          <div className="text-center space-y-1">
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              &copy; {currentYear} UniStake.
            </p>
            <p className="text-[10px] sm:text-xs text-zinc-600">
              Not affiliated with, endorsed by, or connected to Strathmore University.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}