export function resolveSolanaRpcEndpoint(
  configuredEndpoint: string | undefined,
  fallbackEndpoint: string,
) {
  return configuredEndpoint?.trim() || fallbackEndpoint;
}
