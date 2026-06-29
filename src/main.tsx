import { createRoot } from "react-dom/client";
import { FlueProvider } from "@flue/react";
import { createFlueClient } from "@flue/sdk";
import { App } from "./App.tsx";
import "./index.css";

const client = createFlueClient({ baseUrl: "/", fetch: fetch.bind(globalThis) });

createRoot(document.getElementById("root")!).render(
  <FlueProvider client={client}>
    <App />
  </FlueProvider>,
);
