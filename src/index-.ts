import { QMainWindow, WidgetEventTypes } from '@nodegui/nodegui'
import NodeMpv from "node-mpv";

const audioPlayer = new NodeMpv({
  audio_only: true,
  time_update: 1,
  binary: process.env.MPV_EXECUTABLE,
  debug: true,
  verbose: true,
})

const win: QMainWindow = new QMainWindow()
win.setWindowTitle("Test")

try {
  await audioPlayer.start()
  await audioPlayer.load('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'append-play')
} catch (err) {
  console.error(err)
}


win.addEventListener(WidgetEventTypes.Close, async () => {
  await audioPlayer.quit()
  console.log('closed')
})

win.show();

(global as any).win = win
