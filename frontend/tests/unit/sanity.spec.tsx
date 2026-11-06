import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../helpers/renderWithProviders";

describe("Frontend Sanity Check", () => {
  it("renders a simple component inside providers correctly", () => {
    renderWithProviders(<div>Trackfy Frontend Test Runner</div>);
    expect(screen.getByText("Trackfy Frontend Test Runner")).toBeTruthy();
  });
});

