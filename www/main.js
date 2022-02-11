Neutralino.init();

let state = 0

const initialization = async (tafsirData) => {

  const res = await fetch('https://salamquran.com/fa/api/v6/aya/day')
  const ayahdayData = await res.json()

  const data = ayahdayData.result

  const juz = data.juz
  const surah = data.sura
  const ayah = data.aya
  const surahName = data.sura_detail.name
  const translation = data.translate.text

  const padKey = `${surah.padStart(3, '0')}${ayah.padStart(3, '0')}`
  const underscoreKey = `${surah}_${ayah}`
  const surahText = `سوره ${surahName}`
  const juzText = `جزء ${juz}`

  const ayahAudio = `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${padKey}.mp3`
  const tafsirAudio = `https://dl.salamquran.com/ayat/qaraati.fa.qaraati-tafsir-16/${tafsirData[padKey]}.mp3`
  const translationAudio = `https://dl.salamquran.com/ayat/makarem.fa.kabiri-translation-16/${padKey}.mp3`
  
  const ayahImage = `https://everyayah.com/data/images_png/${underscoreKey}.png`

  return {
    surah,
    juz,
    translation,
    title: {
      juz: juzText,
      surah: surahText,
    },
    audio: {
      ayah: ayahAudio,
      tafsir: tafsirAudio,
      translation: translationAudio,
    },
    image: {
      ayah: ayahImage,
    },
  }
}

const loadTafsirData = async () => {
  const res = await fetch('data/tafsir.json')
  const data = await res.json()
  return data
}

const playNextAudio = (audio) => {
  // Play new audio
  const audioElem = document.getElementById('audio')
  const audioSrcElem = document.getElementById('audio-src')
  audioSrcElem.src = audio
  audioElem.load()
  audioElem.play()
}

const nextState = async (event) => {
  const data = event.currentTarget.requiredData

  switch (state) {
    case 0:
      playNextAudio('assets/audios/bismillah.mp3')
      break
    case 1:
      playNextAudio(data.audio.ayah)
      break
    case 2:
      playNextAudio(data.audio.translation)
      break
    case 3:
      playNextAudio(data.audio.tafsir)
      break
   default:
      await Neutralino.app.exit(0);
      return
  }

  state = state + 1
}

Neutralino.events.on('ready', async () => {
  const tafsirData = await loadTafsirData()
  const data = await initialization(tafsirData)

  document.getElementById('surah').innerHTML = data.title.surah
  document.getElementById('juz').innerHTML = data.title.juz
  document.getElementById('text').innerHTML = data.translation

  const image = document.createElement("img")
  image.src = data.image.ayah
  document.getElementById('fig').appendChild(image)
  
  document.getElementById('audio').requiredData = data
  document.getElementById('audio').addEventListener('ended', nextState)
})
