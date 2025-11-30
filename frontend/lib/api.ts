import { Task, TaskCreateInput, TaskSort, TaskStatus, TaskUpdateInput } from "./types";

type FetchParams = {
  search?: string | null;
  status?: TaskStatus | null;
  sort?: TaskSort;
  category?: string | null;
};

const baseUrl = "/api/tasks";

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = (data as { detail?: string }).detail || "Request failed";
    throw new Error(detail);
  }
  return data as T;
}

export async function fetchTasks(params: FetchParams = {}): Promise<Task[]> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.sort) qs.set("sort", params.sort);
  if (params.category) qs.set("category", params.category);

  const url = qs.toString() ? `${baseUrl}?${qs.toString()}` : baseUrl;
  const response = await fetch(url, { cache: "no-store" });
  return handleResponse<Task[]>(response);
}

export async function createTask(payload: TaskCreateInput): Promise<Task> {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse<Task>(response);
}

export async function updateTask(id: number, payload: TaskUpdateInput): Promise<Task> {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const detail = (data as { detail?: string }).detail || "Delete failed";
    throw new Error(detail);
  }
}

export async function reorderTasks(order: number[]): Promise<Task[]> {
  const response = await fetch(`${baseUrl}/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });
  return handleResponse<Task[]>(response);
}
