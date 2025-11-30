export type TaskStatus = "all" | "done" | "undone";
export type TaskSort = "priority_asc" | "priority_desc" | null;

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: number;
  created_at: string;
};

export type TaskCreateInput = {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: number;
};

export type TaskUpdateInput = Partial<TaskCreateInput>;
