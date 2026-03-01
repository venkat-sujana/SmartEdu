"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function invigilationLogoutAction() {
  const store = await cookies();
  store.set("invigilation_token", "", { path: "/", maxAge: 0 });
  redirect("/invigilation/login");
}

