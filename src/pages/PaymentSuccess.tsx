import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [params] = useSearchParams();

  useEffect(() => {
    const check = async () => {
      try {
        const resultCode = params.get("resultCode");
        const amount = params.get("amount");
        const extraData = params.get("extraData");

        const res = await apiClient.checkPayment({
          resultCode,
          amount,
          extraData,
        });

        // Try to refresh user info so the dashboard shows updated quota
        try {
          const user = await apiClient.getUserInfo();
          console.log("Updated user after payment:", user);
        } catch (e) {
          console.warn("Could not refresh user info after payment", e);
        }

        // Show success message and redirect back to dashboard
        toast({
          title: "Payment Success",
          description: "Your storage quota has been upgraded!",
        });

        setTimeout(() => {
          // Force reload to ensure dashboard fetches fresh data
          window.location.href = "/dashboard";
        }, 1500);
      } catch (err) {
        console.error("Payment check failed:", err);
        toast({
          title: "Payment Failed",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    };

    check();
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">Processing Payment...</h1>
      <p>Please wait...</p>
    </div>
  );
}
