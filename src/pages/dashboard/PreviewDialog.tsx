import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileItem } from "@/lib/api";

interface PreviewDialogProps {
  file: FileItem | null;
  onClose: () => void;
}

export default function PreviewDialog({ file, onClose }: PreviewDialogProps) {
  if (!file) return null;

  const url = file.s3Url || "";

  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = url.endsWith(".pdf");
  const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
  const isText = url.match(/\.(txt|json|md|log)$/i);

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
        </DialogHeader>

        {/* ẢNH */}
        {isImage && (
          <img
            src={url}
            alt={file.name}
            className="rounded w-full max-h-[600px] object-contain"
          />
        )}

        {/* PDF */}
        {isPdf && (
          <iframe
            src={url}
            className="w-full h-[600px] rounded"
          />
        )}

        {/* VIDEO */}
        {isVideo && (
          <video controls className="w-full rounded max-h-[600px]">
            <source src={url} type="video/mp4" />
          </video>
        )}

        {/* TEXT */}
        {isText && (
          <iframe
            src={url}
            className="w-full h-[500px] rounded bg-muted"
          />
        )}

        {/* FALLBACK */}
        {!isImage && !isPdf && !isVideo && !isText && (
          <div className="p-4 text-center text-muted-foreground">
            No preview available.
            <a
              href={url}
              target="_blank"
              className="text-blue-500 underline block mt-2"
            >
              Download file
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
