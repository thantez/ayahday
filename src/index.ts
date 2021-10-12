// Imports
import { QMainWindow, QWidget, QLabel, FlexLayout, WidgetEventTypes, QPixmap, QFont, QScrollArea, QScrollBar, QPushButton } from '@nodegui/nodegui'
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

const makeButtonsContainer = (): QWidget => {
  const container: QWidget = new QWidget()
  const layout: FlexLayout = new FlexLayout()
  container.setObjectName('buttonsContainer')
  container.setLayout(layout)

  // Play & Pause button
  const controlButton: QPushButton = new QPushButton()
  controlButton.setObjectName('controlButton')
  controlButton.setText('|>')
  controlButton.setFont(new QFont('Fira Code'))
  controlButton.setInlineStyle(`
    width: 50px;
    height: 50px;
  `)

  controlButton.addEventListener('clicked', async () => {
    if (await audioPlayer.isPaused()) {
      controlButton.setText('|>')
    } else {
      controlButton.setText('||')
    }
    audioPlayer.togglePause()
  });

  // Forward seek button
  const fSeekButton: QPushButton = new QPushButton()
  fSeekButton.setObjectName('fSeekButton')
  fSeekButton.setText('>>')
  fSeekButton.setFont(new QFont('Fira Code'))
  fSeekButton.setInlineStyle(`
    width: 50px;
    height: 50px;
  `)

  fSeekButton.addEventListener('clicked', async () => {
    audioPlayer.seek(10)
  });

  // Backward seek button
  const bSeekButton: QPushButton = new QPushButton()
  bSeekButton.setObjectName('bSeekButton')
  bSeekButton.setText('<<')
  bSeekButton.setFont(new QFont('Fira Code'))
  bSeekButton.setInlineStyle(`
    width: 50px;
    height: 50px;
  `)

  bSeekButton.addEventListener('clicked', async () => {
    audioPlayer.seek(-10)
  });

  layout.addWidget(bSeekButton)
  layout.addWidget(controlButton)
  layout.addWidget(fSeekButton)

  container.setInlineStyle(`
    display: 'flex';
    align-items: 'center';
    flex-direction: 'row';
    justify-content: 'space-between';
    width: 200px;
  `)

  return container
}

const makeTranslationContainer = (translation: string): QWidget => {
  const font: QFont = new QFont()
  font.setFamily('Vazir')
  font.setWeight(87) // Black
  font.setPixelSize(18)
 
  const translationLabel: QLabel = new QLabel()
  translationLabel.setText(translation)
  translationLabel.setAlignment(8)
  translationLabel.setFont(font)
  translationLabel.setLineWidth(10)
  translationLabel.setWordWrap(true)
  translationLabel.setInlineStyle(`
    margin: 0 20px;
    width: ${WIDTH-100}px;
    padding: 0 80px;
  `)

  return translationLabel
}

const makeImagesContainer = async (todayAyah: Ayah): Promise<QWidget> => {
  const container: QWidget = new QWidget()
  const layout: FlexLayout = new FlexLayout()
  container.setLayout(layout)

  const components: InitComponents = await init()
  
  const image: QPixmap = await getImage(todayAyah.imageUrl)
  const imageLabel = new QLabel()
  imageLabel.setPixmap(image)

  const translationContainer: QWidget = makeTranslationContainer(todayAyah.translation)
  const buttonsContainer: QWidget = makeButtonsContainer()

  layout.addWidget(components.auzobillahLabel)
  layout.addWidget(components.bismillahLabel)
  layout.addWidget(imageLabel)
  layout.addWidget(translationContainer)
  layout.addWidget(buttonsContainer)

  container.setInlineStyle(`
    display: 'flex';
    align-items: 'center';
    flex-direction: 'column';
    padding: 40px;
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
win.setFixedSize(WIDTH, WIDTH)


try {
  const center: QWidget = new QWidget()
  const layout: FlexLayout = new FlexLayout()
  center.setLayout(layout)

  const scrollBar: QScrollBar = new QScrollBar()
  scrollBar.setInlineStyle('width: 16px;')

  const scrollArea: QScrollArea = new QScrollArea()
  scrollArea.setWidgetResizable(false)
  scrollArea.setVerticalScrollBar(scrollBar)
  scrollArea.setInlineStyle(`
    display: 'flex';
    width: ${WIDTH}px;
    min-height: ${WIDTH}px;
  `)
  const scrollAreaContainer = scrollArea.takeWidget()
  if (scrollAreaContainer) {
    scrollAreaContainer.close()
  }

  const todayAyah: Ayah = await getAyah()

  const imagesContainer: QWidget = await makeImagesContainer(todayAyah)

  scrollArea.setWidget(imagesContainer)

  layout.addWidget(scrollArea)

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
