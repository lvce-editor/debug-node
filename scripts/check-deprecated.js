import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// TODO could download deprecated data from https://www.cssportal.com/css-properties/

const __dirname = dirname(fileURLToPath(import.meta.url))
const extension = join(__dirname, '../packages/extension')

const getDataProperties = async () => {
  const content = await readFile(
    join(extension, 'data/css-properties.json'),
    'utf-8'
  )
  const json = JSON.parse(content)
  return json
}

const getDeprecatedProperties = async () => {
  const content = await readFile(join(__dirname, './deprecated.json'), 'utf-8')
  const json = JSON.parse(content)
  return json
}

const getTestedProperties = async () => {
  const text = await readFile(
    join(extension, 'test/propertyTabCompletion.test.js'),
    'utf-8'
  )
  const strings = [...text.matchAll(/test\('(.*?)'/g)].map((x) => x[1])
  return new Set(strings)
}

const checkDeprecated = async () => {
  const dataProperties = await getDataProperties()
  const deprecatedProperties = await getDeprecatedProperties()
  const testedProperties = await getTestedProperties()
  const deprecatedPropertySet = new Set(
    deprecatedProperties.map((property) => property.name)
  )
  for (const testedProperty of testedProperties) {
    if (deprecatedPropertySet.has(testedProperty)) {
      console.warn(`deprecated property: ${testedProperty}`)
    }
  }
  for (const key of Object.keys(dataProperties)) {
    if (deprecatedPropertySet.has(key)) {
      console.warn(`deprecated property: ${key}`)
    }
  }
}

const main = async () => {
  await checkDeprecated()
}

main()
