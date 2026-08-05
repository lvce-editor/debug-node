export const getDebugWorkerUrl = () => {
  return new URL(
    '../../debug-worker/dist/javascriptDebugWorkerMain.js',
    import.meta.url,
  ).toString()
}
