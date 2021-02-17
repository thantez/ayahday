const req = require('jsonrequest')
const {
  app,
  BrowserWindow,
} = require('electron')
const { 
  WIDTH,
  HEIGHT,
} = require('./configs')

const makeVerse = (surah, ayah) => {
  const padSurah = surah.padStart(3, '0')
  const padAyah = ayah.padStart(3, '0')
  return {
    verse: `${surah}_${ayah}`,
    padVerse: `${padSurah}${padAyah}`,
  }
}

const makeParams = (verse, padVerse, name, ayah, translation) => {
  return '?' +
    `verse=${verse}&` +
    `padverse=${padVerse}&` +
    `ayah=${ayah}&` +
    `name=${name}&` +
    `translation=${translation}&`
}

const AyahOfDay = async () => {
  try {
    const body = await req('https://salamquran.com/fa/api/v6/aya/day')
    
    if(!body.ok) {
      throw new Error('Get Ayah has problem')
    }
   
    const result = body.result
    const surah = result.sura
    const ayah = result.aya
    const translation = result.translate.text
    const name = result.sura_detail.name
    const verses = makeVerse(surah, ayah)
    return makeParams(
      verses.verse,
      verses.padVerse,
      name,
      ayah,
      translation
    )
  } catch(err) {
    return `?err=${err}`
  }
}

const createWindow = async () => {
  const params = await AyahOfDay()
  mainWindow = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
  })
  console.log(params)
  mainWindow.loadURL(`file://${__dirname}/views/index.html${params}`)
}

app.on('ready', async () => {
  await createWindow()
})
