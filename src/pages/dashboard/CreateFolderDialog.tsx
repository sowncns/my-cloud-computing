import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CreateFolderDialog({
  onCreate,
}: {
  onCreate: (name: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return; // ⛔ Chặn tên rỗng

    try {
      await onCreate(name);   // gọi Dashboard → gọi API
      setName("");            // reset
      setOpen(false);         // 🔥 đóng dialog sau khi thành công
    } catch (error) {
      console.error(error);
      // nếu BE lỗi → dialog không đóng
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">New Folder</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button className="w-full mt-4" onClick={handleSubmit}>
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
}
