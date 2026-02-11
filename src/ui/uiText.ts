export const UI_TEXT = {
  pagination: {
    hint: {
      normal: "Use ← → to navigate",
      disabled: "Finish undo action first",
    },
    prev: "Prev",
    next: "Next",
  },

  confirm: {
    clearCompleted: {
      title: (count: number) =>
        `Clear ${count} completed todo${count > 1 ? "s" : ""}?`,
      description: "This action cannot be undone.",
      confirm: "Clear",
      cancel: "Cancel",
    },
  },
};
