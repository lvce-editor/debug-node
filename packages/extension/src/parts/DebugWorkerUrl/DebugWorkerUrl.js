export const getDebugWorkerUrl = () => {
  return new URL(
    '../../../../debug-worker/src/javascriptDebugWorkerMain.js',
    import.meta.url,
  ).toString()
}
