// Imports
import { QMainWindow, QWidget, QLabel, FlexLayout, WidgetEventTypes, QPixmap, QFont } from '@nodegui/nodegui'
import axios, { AxiosResponse } from 'axios'
import NodeMpv from "node-mpv";
import fs from 'fs'

// Constants
const WIDTH = 800
const PATH = `${process.cwd()}`
const ASSETS = `${PATH}/assets`
const TAFSIRFILES = JSON.parse(fs.readFileSync(`${ASSETS}/tafsir.json`, 'utf-8'))

// Configs
const audioPlayer = new NodeMpv({
  audio_only: true,
  time_update: 1,
  binary: process.env.MPV_EXECUTABLE,
  debug: true,
  verbose: true,
})

// Interfaces
interface InitComponents {
  bismillahLabel: QLabel
  auzobillahLabel: QLabel
}

interface Verse {
  verse: string
  padVerse: string
}

interface Ayah {
  number: string
  name: string
  translation: string
  imageUrl: string
  audioUrl: string
  translationAudioUrl: string
  tafsirAudioUrl: string
}

// Functions
const init = async (): Promise<InitComponents> => {
  await audioPlayer.start()

  const auzobillahImage: QPixmap = new QPixmap()
  auzobillahImage.load(`${ASSETS}/images/AUZOBILLAH.png`)
  const scaledAuzobillah: QPixmap = auzobillahImage.scaled(WIDTH/4, WIDTH/4, 1)

  const auzobillahLabel: QLabel = new QLabel()
  auzobillahLabel.setPixmap(scaledAuzobillah)
  auzobillahLabel.setInlineStyle('margin-bottom: 10px;')

  const bismillahImage: QPixmap = new QPixmap()
  bismillahImage.load(`${ASSETS}/images/BISMILLAH.png`)
  const scaledBismillah: QPixmap = bismillahImage.scaled(WIDTH/2, WIDTH/2, 1)

  const bismillahLabel: QLabel = new QLabel()
  bismillahLabel.setPixmap(scaledBismillah)
  bismillahLabel.setInlineStyle('margin-bottom: 10px;')

  const components: InitComponents = {
    auzobillahLabel,
    bismillahLabel,
  }
  return components
}

const makeImagesContainer = async (todayAyah: Ayah): Promise<QWidget> => {
  const container: QWidget = new QWidget()
  const layout: FlexLayout = new FlexLayout()
  container.setLayout(layout)

  const components: InitComponents = await init()
  
  const image: QPixmap = await getImage(todayAyah.imageUrl)
  const imageLabel = new QLabel()
  imageLabel.setPixmap(image)

  const font: QFont = new QFont()
  font.setFamily('Vazir')
  font.setWeight(87) // Black
  font.setPixelSize(18)
 
  const translationLabel: QLabel = new QLabel()
  translationLabel.setText(todayAyah.translation)
  translationLabel.setAlignment(8)
  translationLabel.setFont(font)
  translationLabel.setLineWidth(10)
  translationLabel.setWordWrap(true)

  layout.addWidget(components.auzobillahLabel)
  layout.addWidget(components.bismillahLabel)
  layout.addWidget(imageLabel)
  layout.addWidget(translationLabel)

  container.setInlineStyle(`
    display: 'flex';
    align-items: 'center';
    flex-direction: 'column';
    margin: 25px 50px;
    WIDTH: ${WIDTH}px;
    height: ${WIDTH}px;
  `)

  return container
}

const makeVerse = (surah: string, ayah: string): Verse => {
  const padSurah = surah.padStart(3, '0')
  const padAyah = ayah.padStart(3, '0')
  return {
    verse: `${surah}_${ayah}`,
    padVerse: `${padSurah}${padAyah}`,
  }
}

const getAyah = async (): Promise<Ayah> => {
  const url = 'https://salamquran.com/fa/api/v6/aya/day'
  const resp: AxiosResponse = await axios.get(url)
  const body = resp.data

  if (!body['ok']) {
    //TODO: error
    throw Error('err')
  }
  
  const result = body['result']
  const surah: string = result['sura']
  const number: string = result['aya']
  const translation: string = result['translate']['text']
  const name: string = result['sura_detail']['name']
  const verses: Verse = makeVerse(surah, number)

  // make urls
  const imageUrl: string = `https://everyayah.com/data/images_png/2_282.png`
  const audioUrl: string = `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${verses.padVerse}.mp3`
  const translationAudioUrl: string = `https://dl.salamquran.com/ayat/makarem.fa.kabiri-translation-16/${verses.padVerse}.mp3`
  const tafsirAudioUrl: string = `https://dl.salamquran.com/ayat/qaraati.fa.qaraati-tafsir-16/${TAFSIRFILES[verses.padVerse]}.mp3`

  const todayAyah: Ayah = {
    number,
    name,
    translation,
    imageUrl,
    audioUrl,
    translationAudioUrl,
    tafsirAudioUrl,
  }

  return todayAyah
}

const getImage = async (url: string): Promise<QPixmap> => {
  const resp: AxiosResponse = await axios.get(url, { responseType: 'arraybuffer' })
  const data: Buffer = resp.data

  const image: QPixmap = new QPixmap()
  image.loadFromData(data)
  
  return image
}

const loadAudios = async (audioUrl: string, translationAudioUrl: string, tafsirAudioUrl: string) => {
  await audioPlayer.load(`${ASSETS}/audios/AOZOBILLAH.mp3`, 'append-play')
  await audioPlayer.load(`${ASSETS}/audios/BISMILLAH.mp3`, 'append')
  await audioPlayer.load(audioUrl, 'append')
  await audioPlayer.load(translationAudioUrl, 'append')
  await audioPlayer.load(tafsirAudioUrl, 'append')
}

// Main
const win: QMainWindow = new QMainWindow()
win.setWindowTitle("Ayah Day")

const center: QWidget = new QWidget()
const layout: FlexLayout = new FlexLayout()
center.setLayout(layout)

try {
  const todayAyah: Ayah = await getAyah()

  const imagesContainer: QWidget = await makeImagesContainer(todayAyah)

  layout.addWidget(imagesContainer)

  await loadAudios(todayAyah.audioUrl, todayAyah.translationAudioUrl, todayAyah.tafsirAudioUrl)

  win.setCentralWidget(center)

 } catch (e) {
  console.log(e)
}

win.addEventListener(WidgetEventTypes.Close, async () => {
  if (audioPlayer.isRunning()) {
    await audioPlayer.stop()
    await audioPlayer.quit()
  }
  console.log('closed')
})

win.show();

(global as any).win = win
