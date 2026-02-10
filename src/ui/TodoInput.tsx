type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isAdding: boolean;
};

export function TodoInput({ value, onChange, onSubmit, isAdding }: Props) {
  const disabled = !value.trim() || isAdding;

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* INPUT */}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) {
            onSubmit();
          }
        }}
        placeholder="Nhập việc cần làm..."
        disabled={isAdding}
        className="
          flex-1 h-11 px-4 rounded-xl
          border border-slate-300
          focus:outline-none focus:ring-2 focus:ring-blue-400
          placeholder:text-slate-400
          disabled:bg-slate-100
        "
      />

      {/* ADD BUTTON */}
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="
          h-11 px-4 rounded-xl
          flex items-center justify-center gap-2
          font-medium text-white
          bg-blue-500 hover:bg-blue-600
          active:scale-95 transition cursor-pointer
          disabled:bg-slate-300
          disabled:cursor-not-allowed
          disabled:active:scale-100
        "
      >
        {isAdding ? (
          <span
            className="
              w-4 h-4
              border-2 border-white border-t-transparent
              rounded-full animate-spin
            "
          />
        ) : (
          <>
            <span className="text-lg leading-none">+</span>
            <span>Add</span>
          </>
        )}
      </button>
    </div>
  );
}
