import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const ShareDialog = ({ open, onOpenChange, item, link, copyLink }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share {item?.name}</DialogTitle>
      </DialogHeader>

      <div className="flex items-center gap-2">
        <Input value={link} readOnly />
        <Button variant="outline" onClick={copyLink}>Copy</Button>
      </div>

      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
