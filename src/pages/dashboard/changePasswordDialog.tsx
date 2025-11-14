import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword)
      return setError("Please fill all fields");

    if (newPassword !== confirmPassword)
      return setError("Passwords do not match!");

    setError("");
    setLoading(true);

    try {
      await apiClient.changePassword(oldPassword, newPassword);

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setTimeout(() => {
        setLoading(false);
        onOpenChange(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1000);

    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to update password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-5">
            <img src="../../../../assets/image.png" className="w-12 h-12" />
          </div>
        ) : (
          <>
            <Input
              type="password"
              placeholder="Current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mb-3"
            />

            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-3"
            />

            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="text-red-500 mt-2">{error}</p>}

            <Button className="w-full mt-4" onClick={handleSubmit}>
              Change Password
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
