type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
      "
      onClick={onCancel}
    >
      <div
        className="
          w-full max-w-sm
          bg-white rounded-2xl shadow-xl
          p-6
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>

        {description && (
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="
              px-4 py-2 rounded-lg
              text-slate-600
              hover:bg-slate-100 cursor-pointer
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="
              px-4 py-2 rounded-lg
              bg-red-500 text-white
              hover:bg-red-600 cursor-pointer
            "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
