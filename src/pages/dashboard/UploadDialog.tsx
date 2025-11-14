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

export default function UploadDialog({
  onUpload,
}: {
  onUpload: (file: File) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    if (files.length === 0) return;

    // Upload each file
    for (const file of files) {
      await onUpload(file);
    }
    setFiles([]);          // reset input
    setOpen(false);         // 🔥 TỰ ĐỘNG ĐÓNG SAU KHI UPLOAD
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Upload File
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <Input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
        />

        <Button
          disabled={files.length === 0}
          className="w-full mt-4"
          onClick={handleSubmit}
        >
          Upload
        </Button>
      </DialogContent>
    </Dialog>
  );
}
