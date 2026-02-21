import { ShieldAlert, HeartHandshake, Scale, Mail, AlertTriangle, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Footer() {
  const currentYear = new Date().getFullYear(); 

  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-8 mt-auto">
      <div className="container mx-auto max-w-6xl px-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <img 
              src="/logo.png" 
              alt="UniStake Logo" 
              className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
            />
            {/* SCRUBBED: Now just "Campus Exclusive" */}
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
              Beta v0.1 • Campus Exclusive
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-zinc-400">
            
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
                    {/* UPDATED VOCABULARY */}
                    <li><strong className="text-white">Position Limits:</strong> The maximum allowable trade size per individual market is KES 150,000.</li>
                    <li><strong className="text-white">Platform Fees:</strong> To maintain the servers and platform, UniStake applies a 5% liquidity fee exclusively on the <em>incorrect pool</em> upon market resolution. This fee is completely waived for smaller markets with a total volume under KES 1,000.</li>
                    <li><strong className="text-white">Refunds:</strong> In the event of a unanimous market (where 100% of traders take the same position), all capital is automatically refunded with zero fees.</li>
                    <li><strong className="text-white">Disputes:</strong> Market outcomes are resolved based on real-world verifiable data. Any disputes regarding a market resolution must be submitted to support within 72 hours of the market closing.</li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>

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
                  {/* SCRUBBED: Removed Strathmore Email */}
                  <p>UniStake is built by students, for students. To maintain platform integrity, we securely store your <code className="bg-zinc-900 text-neon-blue px-1 py-0.5 rounded">university</code> email address, basic profile details, and your trading ledger.</p>
                  <p className="text-white font-medium border-l-2 border-neon-blue pl-3 py-1 bg-neon-blue/5">
                    We deeply respect your privacy. Your data, market positions, and transaction history are strictly confidential and will absolutely never be shared with university administration or external third parties.
                  </p>
                  <p>All M-Pesa deposit and withdrawal details are tokenized and processed exclusively via our secure, licensed payment provider.</p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger className="hover:text-neon-blue transition-colors flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" /> Support
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-300 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-neon-blue" /> Contact Support
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm leading-relaxed mt-2">
                  <p>Need help with an M-Pesa transaction, a market dispute, or just want to suggest a new feature? The UniStake team is here for you.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <a 
                      href="https://wa.me/254741201961?text=Hey%20UniStake%20Support!%20I%20need%20help%20with..." 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-lg p-3 transition-colors font-semibold"
                    >
                      <MessageCircle className="h-5 w-5" /> WhatsApp
                    </a>
                    <a 
                      href="mailto:unistake.contact@gmail.com" 
                      className="flex items-center justify-center gap-2 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/20 rounded-lg p-3 transition-colors font-semibold"
                    >
                      <Mail className="h-5 w-5" /> Email Us
                    </a>
                  </div>
                  <p className="text-xs text-zinc-500 text-center mt-2">Typical response time: Under 2 hours</p>
                </div>
              </DialogContent>
            </Dialog>
            
          </div>
        </div>

        <div className="border-t border-zinc-800/50 pt-8 flex flex-col items-center gap-6">
          
          <div className="w-full max-w-3xl bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-white font-semibold text-sm mb-1 flex items-center justify-center sm:justify-start gap-2">
                Trade Smart <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Information markets should be intellectual, not stressful. Set your own limits. If you or a friend needs help managing risk, please contact the <strong className="text-zinc-300">Kenya Red Cross (1199)</strong> or <strong className="text-zinc-300">Gamblers Anonymous Kenya</strong>.
              </p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              &copy; {currentYear} UniStake.
            </p>
            {/* SCRUBBED: Generic Administration Warning */}
            <p className="text-[10px] sm:text-xs text-zinc-600">
              Not affiliated with, endorsed by, or connected to any university administration.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}