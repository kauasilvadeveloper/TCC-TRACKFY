import "@testing-library/react";

// Mock padrão para next/navigation
vi.mock("next/navigation", () => {
  const push = vi.fn();
  const replace = vi.fn();
  const back = vi.fn();
  const forward = vi.fn();
  const prefetch = vi.fn();

  return {
    useRouter: () => ({
      push,
      replace,
      back,
      forward,
      prefetch,
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock padrão para js-cookie
vi.mock("js-cookie", () => {
  const store = new Map<string, string>();
  return {
    default: {
      get: (key: string) => store.get(key),
      set: (key: string, value: string) => store.set(key, value),
      remove: (key: string) => store.delete(key),
    },
  };
});

