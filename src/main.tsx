import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { App } from "./App.tsx";
import "./index.css";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const authEnabled = import.meta.env.VITE_ENABLE_AUTH === "true" && Boolean(clerkKey);

createRoot(document.getElementById("root")!).render(
  authEnabled ? (
    <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
      <App authEnabled />
    </ClerkProvider>
  ) : (
    <App authEnabled={false} />
  ),
);
