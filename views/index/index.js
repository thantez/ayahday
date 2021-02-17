// -- Variables
let state = 0

const urlParams = new URLSearchParams(window.location.search)

const verseKey = urlParams.get('verse')
const padVerseKey = urlParams.get('padverse')
const ayahNumber = urlParams.get('ayah')
const surahName = urlParams.get('name')
const translationText = urlParams.get('translation')

const ayahAudio = `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${padVerseKey}.mp3`
const ayahImage = `https://everyayah.com/data/images_png/${verseKey}.png`
const ayahDetails = `سوره ${surahName} آیه ${ayahNumber}`

// -- Functions
// ---- For play next item
const makeSmall = (id) => {
  // Make preset image smaller
  document.getElementById(`image-${id}`).classList.add('make-small')
}
const addNewAyahImage = (image, id) => {
  // Create element of new image
  const imageElem = document.createElement('img')
  imageElem.setAttribute('src', image)
  imageElem.id = `image-${id}`
  imageElem.className = 'center'
  // Add image element to images
  document.getElementById('images').appendChild(imageElem)
}
const addNewAyahTranslation = (text) => {
  // Add new Ayah text (translation)
  const textElem = document.createElement('p')
  textElem.innerHTML = text
  document.getElementById('texts').appendChild(textElem)
}
const playNextAudio = (audio) => {
  // Play new audio
  const audioElem = document.getElementById('audio')
  const audioSrcElem = document.getElementById('audio-src')
  audioSrcElem.src = audio
  audioElem.load()
  audioElem.play()
}

// ---- Then next item will play!
const playNext = (state) => (nextImage, nextAudio, nextText) => {
  makeSmall(state)
  addNewAyahImage(nextImage, state + 1)
  addNewAyahTranslation(nextText)
  playNextAudio(nextAudio) 
}

// ---- For make Tafsir of Ayah of day
const makeTafsir = () => {
  fetch('./index/tafsir.json')
    .then(res => res.json())
    .then(tafsirData => {
      playNextAudio(
        `https://dl.salamquran.com/ayat/qaraati.fa.qaraati-tafsir-16/${tafsirData[padVerseKey]}.mp3`
      )
    })
}

const nextState = () => {
  const playState = playNext(state)

  switch (state) {
    case 0:
      playState(
        '../assets/images/besmellah7.jpg',
        '../assets/audios/BISMILLAH.mp3',
        'به نام خداوند بخشنده و بخشایشگر'
      )
      break
    case 1:
      playState(
        ayahImage,
        ayahAudio,
        translationText
      )
      break
    case 2:
      makeTafsir()
      break
    default:
      return
  }

  state = state + 1
}

// -- Init works
document.getElementById('title').innerHTML = ayahDetails

// -- Event listeners
document.getElementById('audio').addEventListener('ended', nextState);
