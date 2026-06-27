export function GET(): Response {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? 'unknown',
  })
}
