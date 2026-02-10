import { supabase } from "./supabaseClient";

export async function signUp(email: string, password: string) {
  const res = await supabase.auth.signUp({
    email,
    password,
  });

  console.log("SIGN UP RESULT:", res);
  return res;
}

export async function signIn(email: string, password: string) {
  const res = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("SIGN IN RESULT:", res);
  return res;
}

export function signOut() {
  return supabase.auth.signOut();
}
