import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";

/** Repo icon — simple SVG that evokes a branch/file tree */
function RepoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="text-accent"
    >
      {/* Circle nodes */}
      <circle cx="5" cy="4" r="2" fill="currentColor" />
      <circle cx="5" cy="16" r="2" fill="currentColor" />
      <circle cx="15" cy="10" r="2" fill="currentColor" />
      {/* Branch lines */}
      <line x1="5" y1="6" x2="5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="10" x2="5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Right-side user section — shows avatar + name when signed in, sign-in/sign-up otherwise. */
function UserSection() {
  const { user, isLoaded } = useUser();

  // While Clerk is loading (or key not configured), show a neutral placeholder.
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-border animate-pulse" />
      </div>
    );
  }

  const displayName = user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "User";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <>
      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button className="flex items-center gap-2 rounded border border-border px-3 py-1 text-xs font-medium text-text-dim hover:border-accent hover:text-accent transition-colors cursor-pointer">
              {/* Generic person icon */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6a5 5 0 0 1 10 0H3Z" />
              </svg>
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="flex items-center gap-2 rounded bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent/90 transition-colors cursor-pointer">
              Sign up
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-3">
          {/* Name + email stacked to the left of the avatar */}
          <div className="flex flex-col items-end leading-tight">
            <span className="text-xs font-medium text-text-primary">{displayName}</span>
            {email && <span className="text-[10px] text-text-dim">{email}</span>}
          </div>
          {/* Clerk's UserButton renders the avatar + click-to-open account menu */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 ring-1 ring-border",
              },
            }}
          />
        </div>
      </Show>
    </>
  );
}

/** Top navigation bar: brand identity on the left, user auth on the right. */
export function TopBar({ authEnabled }: { authEnabled: boolean }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-panel px-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <RepoIcon />
        <span className="font-mono text-sm font-semibold tracking-tight text-text-primary">
          CodeLens
        </span>
        <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
          demo
        </span>
      </div>

      {/* Optional demo auth */}
      {authEnabled && <UserSection />}
    </div>
  );
}
