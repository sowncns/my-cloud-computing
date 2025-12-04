import { useState, useEffect } from "react";
import { LogOut, ChevronDown, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  plan: string;
  storageUsed: number;
  storageLimit: number;
}

const UPGRADE_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 99000,
    storage: 10,
    features: ["10GB Storage", "Basic Support", "Up to 5 shared folders"],
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "pro",
    name: "Pro",
    price: 199000,
    storage: 100,
    features: ["100GB Storage", "Priority Support", "Unlimited shared folders", "Advanced sharing"],
    color: "from-purple-400 to-purple-600",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 299000,
    storage: 200,
    features: ["200GB Storage", "24/7 Support", "Team collaboration", "Advanced security"],
    color: "from-orange-400 to-orange-600",
  },
];

export function ProfileMenu() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      try {
        const detail = e.detail || {};
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            storageUsed: detail.storageUsed ?? prev.storageUsed,
            storageLimit: detail.storageLimit ?? prev.storageLimit,
            plan: detail.plan ?? prev.plan,
          };
        });
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("quotaUpdated", handler as EventListener);
    return () => window.removeEventListener("quotaUpdated", handler as EventListener);
  }, []);

  const loadProfile = async () => {
    try {
      const userInfo = await apiClient.getUserInfo();
      setProfile({
        name: userInfo.name || "User",
        email: userInfo.email || "user@example.com",
        plan: userInfo.plan || "Free",
        storageUsed: userInfo.storageUsed ||0,
        storageLimit: userInfo.storageLimit ||15 * 1024 * 1024 * 1024,
    });
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    const plan = UPGRADE_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    try {
      setLoading(true);
      const response = await apiClient.createPayment(plan.price, plan.storage, plan.name);
      // Redirect to payment page if provided
      console.log(response);
      if (response.payUrl) {
        window.location.href = response.payUrl;
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
        ?
      </div>
    );
  }

 
   const percent = profile.storageLimit ? Math.min((profile.storageUsed / profile.storageLimit) * 100, 100) : 0;
  const format = (bytes = 0) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white hover:shadow-md transition-shadow cursor-pointer">
            {profile.name.charAt(0).toUpperCase()}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          {/* Profile Section */}
          <DropdownMenuLabel className="font-normal space-y-3 p-4">
            <div>
              <p className="font-semibold text-sm">{profile.name}</p>
            </div>

            {/* Plan Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Plan: {profile.plan}</span>
              </div>

              {/* Storage Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                
                <Progress value={percent} className="sr-only h-2" />
              </div>
              <p className="text-xs text-gray-600">
                
                <span>{format(profile.storageUsed)} / {format(profile.storageLimit)}</span>
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Upgrade Button */}
          <DropdownMenuItem
            onClick={() => setShowUpgradeDialog(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Zap size={16} className="text-yellow-500" />
            <span>Upgrade Plan</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 cursor-pointer">
            <LogOut size={16} />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Upgrade Plans Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>Choose the perfect plan for your storage needs</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
            {UPGRADE_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 transition-transform hover:scale-105 ${
                  plan.popular ? "border-purple-500 shadow-lg" : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`bg-gradient-to-br ${plan.color} rounded-lg p-4 mb-4 text-white`}>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-2">{plan.storage}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-2xl font-bold">{(plan.price / 1000).toFixed(0)}K VND</p>
                  <p className="text-sm text-gray-600">/month</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading}
                  className={`w-full ${plan.popular ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                >
                  {loading ? "Processing..." : "Choose Plan"}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
