import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface AdminNumberPadProps {
  calledNumbers: number[];
  lastCalledNumber?: number | null;
  onCallNumber?: (number: number) => void;
  disabled?: boolean;
}

export function AdminNumberPad({ calledNumbers, lastCalledNumber, onCallNumber, disabled }: AdminNumberPadProps) {
  // Generate 1-90
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <Card className="p-4 bg-slate-50 border-2">
      <div className="grid grid-cols-10 gap-1 sm:gap-2">
        {numbers.map((number) => {
          const isCalled = calledNumbers.includes(number);

          return (
            <button
              key={number}
              disabled={disabled || isCalled}
              onClick={() => onCallNumber && onCallNumber(number)}
              className={cn(
                "aspect-square flex items-center justify-center text-xs sm:text-sm font-bold rounded-md transition-all",
                "border hover:scale-105 active:scale-95",
                isCalled
                  ? "bg-primary text-primary-foreground border-primary opacity-50 cursor-not-allowed"
                  : number === lastCalledNumber
                    ? "bg-yellow-100 border-yellow-500 text-yellow-700 font-extrabold ring-2 ring-yellow-500 ring-offset-2"
                    : "bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary hover:shadow-sm"
              )}
            >
              {number}
            </button>
          );
        })}
      </div>
    </Card>
  );
}