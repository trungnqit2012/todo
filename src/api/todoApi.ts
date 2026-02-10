import { supabase } from "./supabaseClient";
import type { Todo } from "../types/todo";

/**
 * Fetch todos
 * RLS sẽ tự filter theo user_id
 */
export async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Add todo (BẮT BUỘC gán user_id)
 */
export async function addTodo(title: string): Promise<Todo> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("todos")
    .insert({
      title,
      completed: false,
      user_id: user.id, // 👈 DÒNG QUYẾT ĐỊNH
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Toggle completed
 * RLS đảm bảo chỉ update todo của chính user
 */
export async function toggleTodo(
  id: string,
  completed: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Delete todo
 * RLS đảm bảo chỉ delete todo của chính user
 */
export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) throw error;
}
