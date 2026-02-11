import { useState } from "react";

type Options = {
  completedCount: number;
  onConfirm: () => void;
};

export function useConfirmClearCompleted({
  completedCount,
  onConfirm,
}: Options) {
  const [open, setOpen] = useState(false);

  const openConfirm = () => {
    if (completedCount === 0) return;
    setOpen(true);
  };

  const closeConfirm = () => {
    setOpen(false);
  };

  const confirm = () => {
    onConfirm();
    setOpen(false);
  };

  return {
    open,
    openConfirm,
    closeConfirm,
    confirm,
  };
}
