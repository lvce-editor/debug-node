import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import cheerio from 'cheerio'
import got from 'got'

const __dirname = dirname(fileURLToPath(import.meta.url))
const extension = join(__dirname, '../packages/extension')

const getW3Data = () => {
  return got('https://www.w3.org/Style/CSS/all-properties.en.html').text()
}

const getW3DeprecatedProperties = async () => {
  const w3Data = await getW3Data()
  const $ = cheerio.load(w3Data)
  const $rows = $('#other table tbody tr')
  const deprecatedProperties = new Set()
  const processRow = (index, $row) => {
    const child = $($row).children().get(1)
    const text = $(child).text().trim()
    deprecatedProperties.add(text)
  }
  $rows.each(processRow)
  return deprecatedProperties
}

const getW3Properties = async () => {
  const w3Data = await getW3Data()
  const $ = cheerio.load(w3Data)
  const $rows = $('#list table tbody tr')
  const properties = []
  const propertySet = new Set()
  const processRow = (index, $row) => {
    const child = $($row).children().get(1)
    const text = $(child).text().trim()
    if (propertySet.has(text)) {
      return
    }
    propertySet.add(text)
    if (text !== '--*') {
      properties.push({ name: text })
    }
  }
  $rows.each(processRow)
  return properties
}

const getTestedProperties = async () => {
  const text = await fs.promises.readFile(
    join(extension, 'test/propertyTabCompletion.test.js'),
    'utf-8'
  )
  const strings = [...text.matchAll(/test\('(.*?)'/g)].map((x) => x[1])
  return new Set(strings)
}

const getJsonProperties = async () => {
  const text = await fs.promises.readFile(
    join(extension, 'data/css-properties.json'),
    'utf-8'
  )
  const strings = Object.keys(JSON.parse(text))
  return new Set(strings)
}

const checkNormalProperties = async () => {
  const w3Properties = await getW3Properties()
  const testedProperties = await getTestedProperties()
  for (const property of w3Properties) {
    if (!testedProperties.has(property.name)) {
      console.warn(`missing property: ${property.name}`)
    }
  }
  const w3PropertySet = new Set(w3Properties.map((property) => property.name))
  for (const testedProperty of testedProperties) {
    if (!w3PropertySet.has(testedProperty)) {
      console.warn(`unknown property: ${testedProperty}`)
    }
  }
}

const checkDeprecatedProperties = async () => {
  const deprecatedProperties = await getW3DeprecatedProperties()
  // console.log([...deprecatedProperties])
  const testedProperties = await getJsonProperties()
  for (const property of deprecatedProperties) {
    if (testedProperties.has(property)) {
      console.warn(`deprecated property: ${property}`)
    }
  }
}

const main = async () => {
  await checkNormalProperties()
  await checkDeprecatedProperties()
}

main()
