import { Progress } from "@/components/ui/progress";

export const QuotaCard = ({ used  , total }: any) => {
  const percent = total ? Math.min((used / total) * 100, 100) : 0;
  console.log("QuotaCard - used:", used, "total:", total, "percent:", percent);
  const format = (bytes = 0) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="rounded-lg border bg-card m-4 p-6 mt-6 ">
      <div className="flex justify-between mb-2 text-sm">
        <span>Storage Used</span>
        <span>{format(used)} / {format(total)}</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
};
