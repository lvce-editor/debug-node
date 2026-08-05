export const name = 'debug-node.run-and-debug-does-not-block-sidebar'

export const test = async ({ expect, Locator, SideBar }) => {
  await SideBar.open('Run And Debug')
  await expect(
    Locator('.ActivityBarItem[title="Run and Debug"]'),
  ).toHaveAttribute('aria-selected', 'true')

  await SideBar.open('Search')
  await expect(Locator('.ActivityBarItem[title="Search"]')).toHaveAttribute(
    'aria-selected',
    'true',
  )
}
