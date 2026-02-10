import { APP_CONFIG } from "../config/app.config";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isAdding: boolean;
};

export function TodoInput({ value, onChange, onSubmit, isAdding }: Props) {
  const MAX_LENGTH = APP_CONFIG.MAX_TODO_TITLE_LENGTH;
  const disabled = !value.trim() || value.length > MAX_LENGTH || isAdding;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        {/* INPUT */}
        <input
          value={value}
          maxLength={MAX_LENGTH}
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
            active:scale-95 transition
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

      {/* COUNTER */}
      <div className="mt-1 text-xs text-right text-slate-400">
        {value.length}/{MAX_LENGTH}
      </div>
    </div>
  );
}
