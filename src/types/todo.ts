export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

export type TodoInsert = {
  id: string;
  title: string;
  completed: boolean;
};
