import assert from "node:assert/strict";
import test from "node:test";
import { resolveSolanaRpcEndpoint } from "./solana-rpc.ts";

const fallbackEndpoint = "https://api.mainnet-beta.solana.com/";

test("uses the fallback endpoint when Vercel provides an empty variable", () => {
  assert.equal(resolveSolanaRpcEndpoint("", fallbackEndpoint), fallbackEndpoint);
  assert.equal(resolveSolanaRpcEndpoint("   ", fallbackEndpoint), fallbackEndpoint);
  assert.equal(resolveSolanaRpcEndpoint(undefined, fallbackEndpoint), fallbackEndpoint);
});

test("trims and preserves a configured HTTPS endpoint", () => {
  assert.equal(
    resolveSolanaRpcEndpoint("  https://rpc.example.com  ", fallbackEndpoint),
    "https://rpc.example.com",
  );
});
