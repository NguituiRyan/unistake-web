import { useState } from 'react';
import { Phone, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useUser } from '@/contexts/UserContext';

interface DepositDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (phoneNumber: string, amount: number) => Promise<void>;
}

export function DepositDrawer({ isOpen, onClose, onDeposit }: DepositDrawerProps) {
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '+254');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!phoneNumber || phoneNumber.length < 10 || !amountNum || amountNum <= 0) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onDeposit(phoneNumber, amountNum);
      setIsSuccess(true);
      
      // Reset after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setPhoneNumber(user?.phoneNumber || '+254');
        setAmount('');
        onClose();
      }, 2000);
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure it starts with +254
    if (!value.startsWith('+254')) {
      value = '+254' + value.replace(/^\+?254?/, '').replace(/\D/g, '');
    } else {
      value = '+254' + value.slice(4).replace(/\D/g, '');
    }
    setPhoneNumber(value);
  };

const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow the user to clear the input
    if (value === '') {
      setAmount('');
      return;
    }

    // Stop them if they try to type more than 6 digits
    if (value.length > 6) return;

    // Stop them if the number goes over 150,000
    const numValue = parseInt(value, 10);
    if (numValue > 150000) {
      // Optional: You could also automatically set it to '150000' here instead of blocking
      return; 
    }

    setAmount(value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-white">
                Deposit Funds
              </SheetTitle>
            </div>
            <SheetDescription className="text-zinc-400">
              Top up your account using M-Pesa
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 px-6 py-6">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="h-16 w-16 rounded-full bg-neon-green/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-neon-green" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">Success!</h3>
                  <p className="text-zinc-400">Check your phone for the STK push</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-zinc-300">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+254 7XX XXX XXX"
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-neon-green focus:ring-neon-green/20"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Enter your M-Pesa registered number
                  </p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-zinc-300">
                    Amount (KES)
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="500"
                      min="10"
                      max="150000"
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-neon-green focus:ring-neon-green/20"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Min: KES 10 | Max: KES 150,000
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={isLoading}
                      className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !phoneNumber || phoneNumber.length < 10 || !amount || parseFloat(amount) <= 0}
                  className="w-full h-12 bg-neon-green hover:bg-green-500 text-black font-semibold text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending STK Push...
                    </span>
                  ) : (
                    'Top Up via M-Pesa'
                  )}
                </Button>

                {/* Security Note */}
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-xs text-center text-zinc-500">
                    Secure payment powered by M-Pesa. You will receive an STK push notification on your phone to complete the transaction.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
