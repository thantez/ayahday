// Imports
import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QIcon, QImage, QPixmap } from '@nodegui/nodegui'
import axios, { AxiosResponse } from 'axios'
import logo from '../assets/logox200.png'

// Constants
const WIDTH = 800

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
const init = (): InitComponents => {
  const assets_path = `${process.cwd()}/assets`

  const auzobillahImage: QPixmap = new QPixmap()
  auzobillahImage.load(`${assets_path}/images/AUZOBILLAH.png`)
  const scaledAuzobillah: QPixmap = auzobillahImage.scaled(WIDTH/4, WIDTH/4, 1)

  const auzobillahLabel: QLabel = new QLabel()
  auzobillahLabel.setPixmap(scaledAuzobillah)
  auzobillahLabel.setInlineStyle('margin-bottom: 10px;')

  const bismillahImage: QPixmap = new QPixmap()
  bismillahImage.load(`${assets_path}/images/BISMILLAH.png`)
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

  const components: InitComponents = init()
  
  const image: QPixmap = await getImage(todayAyah.imageUrl)
  const imageLabel = new QLabel()
  imageLabel.setPixmap(image)
 
  layout.addWidget(components.auzobillahLabel)
  layout.addWidget(components.bismillahLabel)
  layout.addWidget(imageLabel)

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
  const imageUrl: string = `https://everyayah.com/data/images_png/${verses.verse}.png`
  const audioUrl: string = `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${verses.padVerse}.mp3`
  const translationAudioUrl: string = `https://...` // TODO
  const tafsirAudioUrl: string = `https://dl.salamquran.com/ayat/qaraati.fa.qaraati-tafsir-16/${verses.padVerse}.mp3`

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

  win.setCentralWidget(center)

 } catch (e) {
  console.log(e)
}

win.show();

(global as any).win = win
