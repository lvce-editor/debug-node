export const getDebugWorkerUrl = () => {
  return new URL(
    '../../../../debug-worker/src/debugWorkerMain.js',
    import.meta.url,
  ).toString()
}
