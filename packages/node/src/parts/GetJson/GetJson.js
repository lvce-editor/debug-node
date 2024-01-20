export const getJson = async (url) => {
  const response = await fetch(url, {
    // mode: 'no-cors',
    mode: 'no-cors',
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}
