import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { FlueProvider } from "@flue/react";
import { createFlueClient } from "@flue/sdk";
import { App } from "./App.tsx";
import "./index.css";

const client = createFlueClient({ baseUrl: "/", fetch: fetch.bind(globalThis) });
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
    <FlueProvider client={client}>
      <App />
    </FlueProvider>
  </ClerkProvider>,
);
