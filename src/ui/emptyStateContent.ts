import type { Filter } from "../types/filter";

export type EmptyStateContent = {
  title: string;
  description?: string;
};

export function getEmptyStateContent(filter: Filter): EmptyStateContent {
  switch (filter) {
    case "active":
      return {
        title: "No active todos 🎉",
        description: "You’ve completed everything. Nice work!",
      };

    case "completed":
      return {
        title: "No completed todos yet",
        description: "Finish some tasks and they’ll show up here.",
      };

    default:
      return {
        title: "No todos yet",
        description: "Add your first todo above 👆",
      };
  }
}
