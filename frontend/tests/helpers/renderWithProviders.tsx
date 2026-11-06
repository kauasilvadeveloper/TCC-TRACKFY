import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { AuthProvider } from "@/src/context/AuthContext";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  theme?: "dark" | "light";
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

