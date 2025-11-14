import { Button } from "@/components/ui/button";

export const Breadcrumb = ({ path, onNavigate }: any) => {
  return (
   <div className=" items-center gap-1 mb-4 ml-1 text-sm font-medium z-50 fixed top-[190px] bg-background px-4 flex items-center gap-1 whitespace-nowrap overflow-x-auto no-scrollbar">
  {path.map((p, index) => (
    <div key={p.id} className="flex items-center">
      <button
        onClick={() => {
          onNavigate(p.id, index);
        }}
        className="hover:underline text-blue-600"
      >
        {p.name}
      </button>
      {index < path.length - 1 && <span className="mx-1">/</span>}
    </div>
  ))}

</div>
  );
};
