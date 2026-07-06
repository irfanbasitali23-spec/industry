import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

export default function SignaturePad({ label, nameValue, onNameChange, sigRef }) {
  const clear = () => sigRef.current?.clear();

  const toDataURL = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return null;
    return sigRef.current.toDataURL('image/png');
  };

  // Expose toDataURL via ref
  if (sigRef) {
    sigRef.toDataURL = toDataURL;
  }

  return (
    <div className="card">
      <h3 className="mb-4 font-display text-base font-semibold text-surface-800">{label}</h3>
      <input
        type="text"
        className="input mb-3"
        placeholder="Full name"
        value={nameValue}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <div className="relative">
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{ className: 'signature-canvas' }}
          penColor="#1e293b"
          minWidth={1.5}
          maxWidth={3}
        />
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs text-surface-500 shadow-sm hover:text-red-500"
        >
          <Eraser className="h-3 w-3" /> Clear
        </button>
      </div>
    </div>
  );
}
