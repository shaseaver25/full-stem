import { useState } from 'react';
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface VerificationResult {
  verified: boolean;
  entry: {
    hash: string;
    signature: string;
    date: string;
    algorithm: string;
    signatureMethod: string;
  };
  pageUrl: string;
  metadata?: {
    version: string;
    generated: string;
    issuer: string;
  };
  verificationError?: string;
  reason?: string;
}

export const ProvenanceBadge = () => {
  const [open, setOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const verifyPage = async () => {
    setVerifying(true);
    try {
      const currentPath = window.location.pathname;
      const response = await fetch(
        `https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/provenance-verify?url=${encodeURIComponent(currentPath)}`
      );
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data: VerificationResult = await response.json();
      setResult(data);

      if (data.verified) {
        toast({
          title: 'Content Verified',
          description: 'This page has been cryptographically verified.',
        });
      } else {
        toast({
          title: 'Verification Unavailable',
          description: data.reason || 'Could not verify page signature.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Failed to verify page provenance.',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <Shield className="h-4 w-4" />
          Verify Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Content Provenance Verification</DialogTitle>
          <DialogDescription>
            Verify the authenticity and integrity of this page using cryptographic signatures.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!result ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                This page includes cryptographic hash verification to ensure content authenticity.
              </p>
              <Button onClick={verifyPage} disabled={verifying} className="gap-2">
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Verify This Page
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 rounded-lg border bg-muted/50">
                {result.verified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium">Verified</p>
                      <p className="text-sm text-muted-foreground">
                        Content integrity confirmed
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium">Verification Unavailable</p>
                      <p className="text-sm text-muted-foreground">
                        {result.reason || 'Could not verify signature'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {result.entry && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Page URL</p>
                    <p className="font-mono text-xs break-all">{result.pageUrl}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Hash (SHA-256)</p>
                    <p className="font-mono text-xs break-all">{result.entry.hash}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Generated</p>
                    <p className="text-xs">{new Date(result.entry.date).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Algorithm</p>
                    <p className="text-xs">{result.entry.algorithm} / {result.entry.signatureMethod}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResult(null);
                    verifyPage();
                  }}
                  className="gap-2"
                >
                  Verify Again
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p className="mb-2">
              <strong>Copyright © 2025 TailorEDU.</strong> All rights reserved.
            </p>
            <p>
              For DMCA takedown requests or copyright inquiries, contact:{' '}
              <a href="mailto:legal@tailoredu.com" className="underline">
                legal@tailoredu.com
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
