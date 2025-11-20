import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, Loader2 } from "lucide-react";
import { getValidDriveToken, hasDriveAccess } from "@/utils/googleDrive";
import { DriveReauthorization } from "./DriveReauthorization";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/utils/env";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

interface DriveFilePickerProps {
  onFileSelected: (file: DriveFile) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const developerKey = import.meta.env.VITE_GOOGLE_API_KEY;

export function DriveFilePicker({
  onFileSelected,
  disabled = false,
  variant = "outline",
  size = "default",
}: DriveFilePickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { signInWithGoogle } = useGoogleAuth();

  useEffect(() => {
    // Check if user has Drive access
    const checkAccess = async () => {
      const hasAccess = await hasDriveAccess();
      console.log("🔍 Drive access check result:", hasAccess);
      setNeedsAuth(!hasAccess);
    };

    checkAccess();

    // Listen for auth state changes to recheck access
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state changed in DriveFilePicker:", event);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        // Wait a moment for tokens to be stored, then recheck
        setTimeout(async () => {
          console.log("🔄 Rechecking Drive access after auth change...");
          await checkAccess();
        }, 1500);
      }
    });

    // Load Google Picker API
    const loadGooglePicker = () => {
      if (window.google?.picker) {
        setPickerLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load("picker", () => {
          console.log("✅ Google Picker API loaded");
          setPickerLoaded(true);
        });
      };
      script.onerror = () => {
        console.error("❌ Failed to load Google Picker API");
        toast({
          title: "Error",
          description: "Failed to load Google Drive picker",
          variant: "destructive",
        });
      };
      document.body.appendChild(script);
    };

    loadGooglePicker();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const handleConnectDrive = async () => {
    setIsConnecting(true);
    console.log("🔗 Connecting to Google Drive...");

    const result = await signInWithGoogle();

    setIsConnecting(false);

    if (result.success) {
      setShowConnectDialog(false);

      // Recheck access after a brief delay to allow tokens to be stored
      console.log("✅ Drive connection initiated, will recheck access...");
      setTimeout(async () => {
        const hasAccess = await hasDriveAccess();
        console.log("🔍 Drive access recheck result:", hasAccess);
        setNeedsAuth(!hasAccess);

        if (hasAccess) {
          toast({
            title: "Success",
            description: "Google Drive is now connected!",
          });
        }
      }, 1500);
    }
  };

  const openPicker = async () => {
    if (!pickerLoaded) {
      toast({
        title: "Loading",
        description: "Google Picker is still loading...",
      });
      return;
    }

    // Check if user has valid Drive token before loading
    console.log("🔍 Checking Drive access before opening picker...");
    const hasAccess = await hasDriveAccess();

    if (!hasAccess) {
      console.log("⚠️ No Drive access detected, prompting for connection...");
      setShowConnectDialog(true);
      return;
    }

    console.log("✅ Drive access confirmed, proceeding with picker...");
    setIsLoading(true);

    try {
      console.log("🔍 Getting Drive access token...");
      console.log(
        "📋 Current user:",
        await (async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          return user?.email;
        })(),
      );

      const accessToken = await getValidDriveToken();

      if (!accessToken) {
        console.error("❌ No valid access token available");
        setShowConnectDialog(true);
        setIsLoading(false);
        return;
      }

      console.log("✅ Token acquired, opening picker...");
      console.log("🔑 API Key present:", !!GOOGLE_API_KEY);

      // Create picker
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .addView(window.google.picker.ViewId.DOCS_IMAGES)
        .addView(window.google.picker.ViewId.DOCS_VIDEOS)
        .addView(window.google.picker.ViewId.SPREADSHEETS)
        .addView(window.google.picker.ViewId.PRESENTATIONS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(developerKey)
        .setCallback((data: any) => {
          console.log("📥 Picker callback:", data.action);

          if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0];
            console.log("📎 File selected:", file);

            const driveFile: DriveFile = {
              id: file.id,
              name: file.name,
              mimeType: file.mimeType,
              url: file.url,
            };

            onFileSelected(driveFile);

            toast({
              title: "File Attached",
              description: `${file.name} has been attached from Google Drive.`,
            });
          } else if (data.action === window.google.picker.Action.CANCEL) {
            console.log("⚠️ Picker cancelled by user");
          }
          setIsLoading(false);
        })
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error("❌ Error opening picker:", error);

      let errorMessage = "Failed to open Google Drive picker. Please try again.";

      if (error instanceof Error) {
        console.error("Error details:", error.message);
        if (error.message.includes("403") || error.message.includes("Forbidden")) {
          errorMessage = "Drive access denied. Please sign in again with Google to grant Drive permissions.";
          setNeedsAuth(true);
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (needsAuth) {
    return <DriveReauthorization onSuccess={() => setNeedsAuth(false)} />;
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={openPicker}
          disabled={disabled || isLoading || !pickerLoaded}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <FolderOpen className="mr-2 h-4 w-4" />
              Attach from Drive
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          You can use your school or personal Google account to attach files.
        </p>
      </div>

      {/* Google Drive Connection Dialog */}
      <AlertDialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect to Google Drive</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You're not currently connected to Google Drive.</p>
              <p>Sign in with your Google account to link your Drive and attach files to lessons.</p>
              <p className="text-xs text-muted-foreground">This works with both school and personal Gmail accounts.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)} disabled={isConnecting}>
              Cancel
            </Button>
            <Button onClick={handleConnectDrive} disabled={isConnecting} className="gap-2">
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Google Drive"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Type declaration for Google Picker API
declare global {
  interface Window {
    gapi: any;
    google: {
      picker: {
        PickerBuilder: new () => any;
        ViewId: {
          DOCS: string;
          DOCS_IMAGES: string;
          DOCS_VIDEOS: string;
          SPREADSHEETS: string;
          PRESENTATIONS: string;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
      };
    };
  }
}
