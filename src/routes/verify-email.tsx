import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { OtpVerification } from "@/components/verify/OtpVerification";
import { supabase } from "@/integrations/supabase/client";

type Search = { email?: string };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    email: typeof search['email'] === "string" ? (search['email'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — Gigz Exchange" },
      { name: "description", content: "Enter the verification code we emailed you to activate your Gigz Exchange account." },
      { property: "og:title", content: "Verify your email — Gigz Exchange" },
      { property: "og:description", content: "Confirm your email address and enter the Gigz Exchange dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyEmailPage,
});

/** Demo code used while email confirmation is disabled for development. */
const DEMO_CODE = "4821";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();
  const [key, setKey] = useState(0);

  const verify = async (code: string) => {
    if (!email) return code === DEMO_CODE;
    // Real path: Supabase email OTP (active once email confirmation is enabled).
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (!error) return true;
    // Development fallback while confirmation emails are disabled.
    return code === DEMO_CODE;
  };

  const resend = async () => {
    if (!email) {
      toast.success("Demo code resent", { description: `Use ${DEMO_CODE} to continue.` });
      return;
    }
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) toast.error(error.message);
    else toast.success("Verification code sent", { description: `We emailed a new code to ${email}.` });
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        email
          ? `We sent a verification code to ${email}. Enter it below to activate your Gigz Exchange account.`
          : "Enter the verification code Gigz Exchange emailed you."
      }
      footer={
        <>
          Wrong address?{" "}
          <Link to="/register" className="font-semibold text-foreground hover:text-accent">Start over</Link>
        </>
      }
    >
      <OtpVerification
        key={key}
        otpCode={DEMO_CODE}
        phoneNumber={email ?? "your email address"}
        title="Enter verification code"
        description={
          <>
            Enter the 4-digit code sent to{" "}
            <span className="font-medium text-foreground">{email ?? "your email address"}</span>
          </>
        }
        onVerify={verify}
        onResend={resend}
        onContinue={() => void navigate({ to: "/dashboard" })}
      />
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Development mode — email confirmation is disabled, so the test code{" "}
        <span className="font-semibold text-foreground">{DEMO_CODE}</span> completes verification.{" "}
        <button onClick={() => setKey((k) => k + 1)} className="font-semibold text-accent underline-offset-4 hover:underline">
          Replay animation
        </button>
      </p>
    </AuthLayout>
  );
}
