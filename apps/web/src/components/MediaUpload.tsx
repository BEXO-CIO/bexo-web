import * as React from 'react';
import { client } from '../lib/api';

interface MediaUploadProps {
  sectionType: 'project' | 'certificate' | 'achievement' | 'research';
  entryId: string;
  onUploadSuccess: (asset: any) => void;
  onDeleteSuccess: () => void;
  currentAssetId?: string | null;
  assetsList?: any[];
}

export function MediaUpload({
  sectionType,
  entryId,
  onUploadSuccess,
  onDeleteSuccess,
  currentAssetId,
  assetsList = [],
}: MediaUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Find the current asset from the lists
  const currentAsset = currentAssetId 
    ? assetsList.find(a => a.id === currentAssetId || a.entry_id === entryId)
    : assetsList.find(a => a.entry_id === entryId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const asset = await client.uploadAsset(sectionType, file, entryId);
      onUploadSuccess(asset);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAsset) return;
    setUploading(true);
    setError('');
    try {
      await client.deleteAsset(currentAsset.id);
      onDeleteSuccess();
    } catch (err: any) {
      setError(err.message || 'Delete failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-2 text-xs">
      {currentAsset ? (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F4] border border-[#DDD0BC]/60">
          <div className="flex items-center gap-2 text-[#5C4A35] truncate">
            <span className="text-base">
              {currentAsset.kind === 'pdf' ? '📄' : '🖼️'}
            </span>
            <span className="font-medium truncate max-w-[180px]">
              {currentAsset.cdn_asset_id}
            </span>
            <span className="text-[10px] text-[#9B8570]">
              ({(currentAsset.size_bytes / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="text-[#E11D48] hover:text-[#BE123C] font-semibold transition"
          >
            {uploading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={sectionType === 'project' || sectionType === 'achievement' ? 'image/*,application/pdf' : 'application/pdf,image/*'}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#DDD0BC] text-[#5C4A35] font-medium hover:bg-[#FAF8F4] transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <span>📎</span> Attach Image or PDF (Max 5MB)
              </>
            )}
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-red-500 font-medium">{error}</p>}
    </div>
  );
}
