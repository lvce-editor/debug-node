import got from 'got'
import fs, { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const extension = join(__dirname, '../packages/extension')

const commit = 'eed426368e871c96223f8d45b22805e3020eb1e7'

const sources = [
  'css-align-3/Overview.bs',
  'css-animations-1/Overview.bs', // animations-2 extends this
  'css-animations-2/Overview.bs',
  'css-backgrounds-3/Overview.bs', // backgrounds-4 extends this
  'css-backgrounds-4/Overview.bs',
  // 'css-block-3',
  'css-box-4/Overview.bs',
  'css-break-3/Overview.bs', // break-4 extends this
  'css-break-4/Overview.bs',
  'css-cascade-6/Overview.bs',
  'css-color-4/Overview.bs', // color-5 extends this
  'css-color-5/Overview.bs',
  'css-color-adjust-1/Overview.bs',
  'css-color-hdr/Overview.bs',
  'css-conditional-4/Overview.bs',
  'css-contain-2/Overview.bs', // contain-3 extends this
  'css-contain-3/Overview.bs',
  'css-content-3/Overview.bs',
  'css-device-adapt-1/Overview.bs',
  'css-display-3/Overview.bs',
  'css-easing-1/Overview.bs',
  'css-egg-1/Overview.bs',
  'css-env-1/Overview.bs',
  'css-exclusions-1/Overview.bs',
  'css-flexbox-1/Overview.bs',
  // 'css-floats-3/Overview.bs',
  'css-font-loading-3/Overview.bs',
  'css-fonts-4/Overview.bs',
  'css-gcpm-3/Overview.bs', // gcpm-4 extends this
  'css-gcpm-4/Overview.bs',
  'css-grid-2/Overview.bs', // grid-3 extends this
  'css-grid-3/Overview.bs',
  'css-highlight-api-1/Overview.bs',
  'css-images-3/Overview.bs', // images-4 extends this
  'css-images-4/Overview.bs',
  'css-inline-3/Overview.bs',
  'css-line-grid-1/Overview.bs',
  'css-lists-3/Overview.bs',
  'css-logical-1/Overview.bs',
  'css-multicol-1/Overview.bs', // multicol-2 extends this
  'css-multicol-2/Overview.bs',
  'css-nav-1/Overview.bs',
  'css-overflow-3/Overview.bs', // overflow-4 extends this
  'css-overflow-4/Overview.bs',
  'css-overscroll-1/Overview.bs',
  'css-page-4/Overview.html',
  'css-page-floats-3/Overview.bs',
  // 'css-page-template-1/Overview.bs',
  'css-position-3/Overview.bs',
  // 'css-preslev-1/Overview.bs',
  'css-shapes-2/Overview.bs',
  'css-regions-1/Overview.bs',
  'css-rhythm-1/Overview.bs',
  'css-ruby-1/Overview.bs',
  'css-scoping-2/Overview.bs',
  'css-scroll-snap-1/Overview.bs',
  'css-scrollbars-1/Overview.bs',
  'css-shapes-1/Overview.bs', // shapes-2 extends this
  'css-shapes-2/Overview.bs',
  'css-size-adjust-1/Overview.bs',
  'css-sizing-4/Overview.bs',
  'css-speech-1/Overview.bs',
  'css-style-attr-1/Overview.html',
  'css-tables-3/Overview.bs',
  'css-template-1/Overview.html',
  'css-text-3/Overview.bs', // text-4 extends this
  'css-text-4/Overview.bs',
  'css-text-decor-4/Overview.bs',
  'css-transforms-2/Overview.bs',
  'css-transitions-1/Overview.bs', // transitions-2 extends this
  'css-transitions-2/Overview.bs',
  'css-ui-4/Overview.bs',
  'css-values-4/Overview.bs',
  'css-values-5/Overview.bs',
  'css-variables-1/Overview.bs',
  'css-will-change-1/Overview.bs',
  'css-writing-modes-3/Overview.bs',
  'css-writing-modes-4/Overview.bs',
]

const getCode = (error) => {
  if (!error || !error.response || !error.response.statusCode) {
    return ''
  }
  return `${error.response.statusCode}`
}

const root = join(__dirname, '..')

const downloadFile = async ({ url, to }) => {
  const absoluteTo = join(root, to)
  if (existsSync(absoluteTo)) {
    console.info(`[download skipped] ${url}`)
    return
  }
  console.info(`[download] ${url}`)

  await mkdir(dirname(absoluteTo), { recursive: true })
  try {
    await pipeline(got.stream(url), fs.createWriteStream(absoluteTo))
  } catch (error) {
    const code = getCode(error)
    console.warn(`[download failed, status code ${code}] ${url}`)
  }
}

const downloadData = async () => {
  if (existsSync(join(root, '.tmp', 'w3c-commitHash'))) {
    const existingCommitHash = readFileSync(
      join(root, '.tmp', 'w3c-commitHash'),
      'utf8'
    )
    if (existingCommitHash !== commit) {
      await rm(join(root, '.tmp'), { recursive: true })
    }
  }
  for (const source of sources) {
    await downloadFile({
      url: `https://raw.githubusercontent.com/w3c/csswg-drafts/${commit}/${source}`,
      to: `.tmp/w3c/${source}.txt`,
    })
  }
  await writeFile(join(root, '.tmp', 'w3c-commitHash'), commit)
}

const PROPDEF_1 = '<pre class="propdef shorthand">'
const PROPDEF_2 = '<pre class="propdef">'
const PROPDEF_3 = '<pre class=propdef>'
const PROPDEF_4 = "<pre class='propdef'>"
const PROPDEF_5 = "<pre class='propdef shorthand'>"
const PROPDEF_6 = "<pre class='descdef'>"
const PROPDEF_7 = '<pre class="propdef partial">'

const isPropertyNameLineBefore = (line) => {
  return (
    line.includes(PROPDEF_1) ||
    line.includes(PROPDEF_2) ||
    line.includes(PROPDEF_3) ||
    line.includes(PROPDEF_4) ||
    line.includes(PROPDEF_5) ||
    line.includes(PROPDEF_6) ||
    line.includes(PROPDEF_7)
  )
}

const getNames = (line) => {
  const index = line.indexOf('Name: ')
  if (index === -1) {
    throw new Error('unexpected format')
  }
  if (line.includes('<dfn id')) {
    return [line.match(/<dfn.*>(.*)<\/dfn>/)[1]]
  }
  const namePart = line.slice(index + 'Name: '.length)
  if (namePart === '--*') {
    return []
  }
  return namePart.split(',').map((name) => name.trim())
}

const extractPropertiesFromContent = (content) => {
  const lines = content.split('\n')
  let isLookingForName = false
  const names = []
  for (const line of lines) {
    if (isLookingForName) {
      isLookingForName = false
      const propertyNames = getNames(line)
      names.push(...propertyNames)
    } else if (isPropertyNameLineBefore(line)) {
      isLookingForName = true
    }
  }
  return names
}

const extractPropertiesFromFile = async (source) => {
  const absoluteFrom = join(__dirname, '..', '.tmp', 'w3c', `${source}.txt`)
  const absoluteTo = join(
    __dirname,
    '..',
    '.tmp',
    'w3c-properties',
    `${source}.json`
  )
  const content = await readFile(absoluteFrom, 'utf-8')
  const properties = extractPropertiesFromContent(content)
  await mkdir(dirname(absoluteTo), { recursive: true })
  await writeFile(absoluteTo, JSON.stringify(properties, null, 2) + '\n')
}

const extractPropertiesFromFiles = async () => {
  for (const source of sources) {
    await extractPropertiesFromFile(source)
  }
}

const combineProperties = async () => {
  const allProperties = []
  for (const source of sources) {
    const absoluteFrom = join(
      __dirname,
      '..',
      '.tmp',
      'w3c-properties',
      `${source}.json`
    )
    const content = await readFile(absoluteFrom, 'utf-8')
    const json = JSON.parse(content)
    const mappedJson = json.map((property) => ({
      name: property,
      source,
    }))
    allProperties.push(...mappedJson)
  }
  const absoluteTo = join(
    __dirname,
    '..',
    '.tmp',
    'w3c-combined',
    'properties.json'
  )
  await mkdir(dirname(absoluteTo), { recursive: true })
  await writeFile(absoluteTo, JSON.stringify(allProperties, null, 2) + '\n')
}

const getTestedProperties = async () => {
  const text = await readFile(
    join(extension, 'test/propertyTabCompletion.test.js'),
    'utf-8'
  )
  const strings = [...text.matchAll(/test\('(.*?)'/g)].map((x) => x[1])
  return new Set(strings)
}

const getCombinedProperties = async () => {
  const absoluteFrom = join(
    __dirname,
    '..',
    '.tmp',
    'w3c-combined',
    'properties.json'
  )
  const content = await readFile(absoluteFrom, 'utf-8')
  const json = JSON.parse(content)
  return json
}

const isWebkit = (property) => {
  return property.startsWith('-webkit-')
}

const checkProperties = async () => {
  const combinedProperties = await getCombinedProperties()
  const testedProperties = await getTestedProperties()
  for (const property of combinedProperties) {
    if (!testedProperties.has(property.name) && !isWebkit(property.name)) {
      console.warn(
        `missing property: ${property.name}, defined in spec ${property.source}`
      )
    }
  }
  const combinedPropertySet = new Set(
    combinedProperties.map((property) => property.name)
  )
  for (const testedProperty of testedProperties) {
    if (!combinedPropertySet.has(testedProperty)) {
      console.warn(`unknown property: ${testedProperty}`)
    }
  }
}

const main = async () => {
  await downloadData()
  await extractPropertiesFromFiles()
  await combineProperties()
  await checkProperties()
}

main()
