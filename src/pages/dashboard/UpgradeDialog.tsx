import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UpgradeDialog({ open, onOpenChange, onSelectPlan }) {
  const plans = [
    { amount: 10000, label: "Thêm 1GB - 10,000đ" ,upStrore :1},
    { amount: 30000, label: "Thêm 5GB - 30,000đ" ,upStore :5 },
    { amount: 100000, label: "Thêm 20GB - 100,000đ" ,upStore :20}
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Storage</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {plans.map((p) => (
            <Button
              key={p.amount}
              variant="outline"
              className="w-full"
              onClick={() => onSelectPlan(p.amount,p.upStore)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
