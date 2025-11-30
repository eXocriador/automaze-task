export type TaskStatus = "all" | "done" | "undone";
export type TaskSort =
  | "priority_asc"
  | "priority_desc"
  | "due_date_asc"
  | "due_date_desc"
  | "created_asc"
  | "created_desc"
  | null;

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: number;
  category?: string | null;
  due_date?: string | null;
  created_at: string;
};

export type TaskCreateInput = {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: number;
  category?: string;
  due_date?: string;
};

export type TaskUpdateInput = Partial<TaskCreateInput>;
