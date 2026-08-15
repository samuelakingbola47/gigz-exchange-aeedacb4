import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { OtpVerification } from "@/components/verify/OtpVerification";
import { useOrders } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/verify")({
  head: () => ({
    meta: [
      { title: "SMS Verification — Gigz Exchange" },
      { name: "description", content: "Enter the 4-digit code from your verification SMS and watch it confirm in real time." },
      { property: "og:title", content: "SMS Verification — Gigz Exchange" },
      { property: "og:description", content: "Confirm your verification code with the Gigz Exchange OTP experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyPage,
});

const DEMO_CODE = "4719";

function VerifyPage() {
  const navigate = useNavigate();
  const { data: active = [] } = useOrders(["waiting", "sms_received"]);
  const order = active[0] ?? null;
  const [key, setKey] = useState(0);

  return (
    <CustomerShell
      title="SMS verification"
      subtitle={`Demo experience — enter ${DEMO_CODE} to see the success flow, any other code shows the error state.`}
    >
      <div className="mx-auto w-full max-w-lg">
        <OtpVerification
          key={key}
          otpCode={DEMO_CODE}
          phoneNumber={order?.phone_number ?? "+234 810 000 0000"}
          expiresAt={order?.expires_at ?? null}
          onResend={() => {
            toast.success("Demo code resent", { description: `Use ${DEMO_CODE} to complete verification.` });
          }}
          onContinue={() => void navigate({ to: "/dashboard/orders" })}
        />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          No SMS provider is connected yet — this screen runs on demo data.{" "}
          <button onClick={() => setKey((k) => k + 1)} className="font-semibold text-accent underline-offset-4 hover:underline">
            Replay animation
          </button>
        </p>
      </div>
    </CustomerShell>
  );
}
