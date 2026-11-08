import "../scripts/polyfill-zstd.cjs"
import "@testing-library/jest-dom/vitest"

// Intercept external network requests during tests
if (typeof globalThis.fetch === "function") {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    if (url.includes("firestore.googleapis.com")) {
      return new Response(JSON.stringify({ name: "mock-doc" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }
    return originalFetch(input, init)
  }
}

