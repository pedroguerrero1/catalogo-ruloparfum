import { useEffect, useMemo, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { useProductImage } from '@/hooks/useProductImage';

interface Props {
  /** Existing product image (Storage path or URL), used for the initial preview when editing. */
  currentImage?: string;
  file: File | null;
  url: string;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
}

export default function AdminImageUpload({ currentImage, file, url, onFileChange, onUrlChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedCurrent = useProductImage(currentImage) ?? '';

  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const pastedUrl = url.trim();
  const preview = objectUrl ?? (pastedUrl.startsWith('http') ? pastedUrl : resolvedCurrent);
  const previewLabel = file ? file.name : pastedUrl.startsWith('http') ? 'URL pegada' : 'Imagen actual';

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">Imagen</label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-card py-6 text-sm font-medium text-muted transition hover:border-gold hover:text-gold"
      >
        <ImagePlus size={20} />
        {file ? '✅ Foto seleccionada' : '📸 Tocá para subir una foto'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0] ?? null;
          onFileChange(selected);
          if (selected) onUrlChange('');
        }}
      />

      <div className="my-2.5 flex items-center gap-2 text-[11px] text-muted">
        <span className="h-px flex-1 bg-border" />
        o pegá una URL
        <span className="h-px flex-1 bg-border" />
      </div>
      <input
        type="text"
        value={url}
        onChange={(e) => {
          onUrlChange(e.target.value);
          if (e.target.value) onFileChange(null);
        }}
        placeholder="https://firebasestorage... (pegá URL de otra imagen)"
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-text outline-none focus:border-gold"
      />

      {preview && (
        <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-border bg-card p-2">
          <img src={preview} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          <span className="truncate text-xs text-muted">{previewLabel}</span>
        </div>
      )}
    </div>
  );
}
