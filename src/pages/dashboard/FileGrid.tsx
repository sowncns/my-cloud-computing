import { FileCard } from "./FileCard";

export const FileGrid = ({ files, onOpenFolder, onDelete, onShare, onDownload, onPreview, onRename, onDetail }: any) => {
    if (!files || files.length === 0)
        return <p className="text-center text-muted-foreground py-10">Empty</p>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((item: any) => (
                <FileCard
                    key={item.id}
                    item={item}
                    onOpenFolder={onOpenFolder}
                    onDelete={onDelete}
                    onShare={onShare}
                    onDownload={onDownload}
                    onPreview={onPreview}
                    onRename={onRename}
                    onDetail={onDetail}
                />
            ))}
        </div>
    );
};
