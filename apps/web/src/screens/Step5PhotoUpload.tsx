import * as React from 'react';
import { useLocation } from 'wouter';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { client } from '../lib/api';

type Phase = 'empty' | 'crop' | 'done';

export default function Step5PhotoUpload() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = React.useState<Phase>('empty');
  const [zoom, setZoom] = React.useState(50);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPhase('crop');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPhase('crop');
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError('');
    try {
      // 1. Get presigned upload URL from API
      const res = await client.request<{ uploadUrl: string, key: string, assetId: string }>("/assets/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: imageFile.name,
          size_bytes: imageFile.size,
          section_type: "photo",
          kind: "image"
        })
      });

      // 2. Upload file directly to S3/MinIO
      const uploadRes = await fetch(res.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": imageFile.type,
        },
        body: imageFile,
      });

      if (!uploadRes.ok) {
        throw new Error('Direct upload to storage failed.');
      }

      // 3. Confirm upload metadata to API
      await client.request("/assets/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: res.assetId,
          filename: imageFile.name,
          size_bytes: imageFile.size,
          section_type: "photo",
          kind: "image",
          s3Key: res.key
        })
      });

      // 4. Update user's profile photo link
      await client.patchProfile({ profile_photo_asset_id: res.assetId });

      setPhase('done');
    } catch (e: any) {
      setError(e.message || 'Failed to upload profile photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={5}>
      <div style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#C1440E' }}>Step 5 of 9</p>
        <h1 className="text-3xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1A18' }}>
          Add your profile photo
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9B8570' }}>
          Profiles with a photo receive 3× more views from employers.
        </p>

        <div className="flex flex-col items-center gap-6">
          {/* Avatar preview */}
          <div
            className="relative rounded-full overflow-hidden flex items-center justify-center"
            style={{ width: 160, height: 160, backgroundColor: '#F5EEE4', border: '3px solid #ECD9C4' }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            {phase === 'empty' && (
              <div className="text-center px-4">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="#B8A898" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-xs" style={{ color: '#B8A898' }}>Your photo</p>
              </div>
            )}
            {(phase === 'crop' || phase === 'done') && previewUrl && (
              <img
                src={previewUrl}
                alt="Profile"
                style={{
                  width: `${100 + zoom}%`,
                  height: `${100 + zoom}%`,
                  objectFit: 'cover',
                  maxWidth: 'none',
                }}
              />
            )}
          </div>

          {phase === 'empty' && (
            <label
              className="px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{ backgroundColor: '#C1440E', color: 'white' }}
            >
              Choose photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}

          {phase === 'crop' && (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1C1A18' }}>
                  Zoom — {zoom}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: '#C1440E' }}
                />
              </div>
              {error && (
                <p className="text-xs text-center font-medium" style={{ color: '#E11D48' }}>
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setPhase('empty'); setPreviewUrl(''); setImageFile(null); setError(''); }}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: '#F5EEE4', border: '1px solid #DDD0BC', color: '#5C4A35', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  Retake
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#C1440E', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />}
                  {loading ? 'Uploading…' : 'Looks good'}
                </button>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="#6B8F71" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium" style={{ color: '#2D5A2E' }}>Photo saved</span>
              </div>
              <button
                onClick={() => navigate('/step/6')}
                className="w-full py-3 rounded-lg font-medium text-sm"
                style={{ backgroundColor: '#C1440E', color: 'white', cursor: 'pointer' }}
              >
                Continue →
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/step/6')}
            className="text-sm"
            style={{ color: '#9B8570', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
