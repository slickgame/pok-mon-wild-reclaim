import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/gelasio/latin-400.css";
import "@fontsource/gelasio/latin-700.css";
import "./town.css";
import { Town } from "./Town";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Town />
  </StrictMode>,
);
