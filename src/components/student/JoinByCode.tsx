import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface JoinByCodeProps {
  onBack: () => void;
  onSubmit: (code: string) => Promise<void>;
  loading: boolean;
}

export const JoinByCode = ({ onBack, onSubmit, loading }: JoinByCodeProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    if (code.length === 8) {
      await onSubmit(code.toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Enter Class Code</CardTitle>
          <CardDescription>
            Type in the 8-character code from your teacher
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={8}
              value={code}
              onChange={(value) => setCode(value.toUpperCase())}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={code.length !== 8 || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining Class...
              </>
            ) : (
              'Join Class'
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Codes are 8 characters long</li>
              <li>Letters and numbers only</li>
              <li>Not case-sensitive</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
