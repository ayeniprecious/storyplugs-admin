"use client";

import { useActionState } from "react";

import { signIn } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/logo-mark";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, { error: null });

  return (
    <div className="flex flex-1">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground md:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <LogoMark className="size-9" />
          <span className="font-brand text-lg font-semibold">StoryPlugs</span>
        </div>
        <div className="relative max-w-sm">
          <p className="text-2xl font-medium text-balance">
            Manage the stories that bring people a little more hope every day.
          </p>
          <p className="mt-3 text-sm text-primary-foreground/70">
            Stories, categories, users, and notifications — all in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 md:hidden">
            <LogoMark className="size-8" />
            <span className="font-brand text-lg font-semibold">StoryPlugs</span>
          </div>
          <h1 className="text-xl font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your admin account to continue.
          </p>

          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
