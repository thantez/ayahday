# Imports
import gi
gi.require_version('Gdk', '3.0')
gi.require_version('Gtk', '3.0')
from gi.repository import Gdk
from gi.repository import Gio
from gi.repository import Gtk
from gi.repository.GdkPixbuf import Pixbuf
from json import load
from os import remove
from playsound import playsound
from sys import exit
from tafsir_information import db
from urllib.request import urlretrieve, urlopen

# Constants declaration ------------- !
AYAH_API_URL = 'https://salamquran.com/fa/api/v6/aya/day'
PIC_SOURCE = 'http://www.everyayah.com/data/images_png'
SOUND_SOURCE = 'http://www.everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps'
TRANSLATE_SOURCE = 'https://dl.salamquran.com/ayat/makarem.fa.kabiri-translation-16'
TAFSIR_SOURCE = 'https://dl.salamquran.com/ayat/qaraati.fa.qaraati-tafsir-16'
AOZOBILLAH = SOUND_SOURCE + '/001000.mp3'
BISMILLAH = SOUND_SOURCE + '/001001.mp3'

# Components definitions
## CSS provider
### I wrote code from this: https://gist.github.com/carlos-jenkins/8923124
provider = Gtk.CssProvider()
provider.load_from_path('style.css')
screen = Gdk.Display.get_default_screen(Gdk.Display.get_default())
GTK_STYLE_PROVIDER_PRIORITY_APPLICATION = 600
Gtk.StyleContext.add_provider_for_screen(
    screen, provider,
    GTK_STYLE_PROVIDER_PRIORITY_APPLICATION
)
## Main components
builder = Gtk.Builder()
builder.add_from_file('gui.glade')
## Get Objects
gui = builder.get_object('Window')
ayah_img = builder.get_object('AyahImg')
translation_label = builder.get_object('TranslationLabel')
ayah_label = builder.get_object('AyahLabel')
## Set signals
gui.connect("destroy", lambda _: exit(1))

# Function declarations
def get_verse_key(ayah_json):
    if ayah_json['ok']:
        surah = ayah_json['result']['sura']
        ayah = ayah_json['result']['aya']
        with_zero_surah = surah.zfill(3)
        with_zero_ayah = ayah.zfill(3)
        surah_name = ayah_json['result']['sura_detail']['name']
        translation = ayah_json['result']['translate']['text']
        return (
            (
                f'{surah}_{ayah}',
                f'{with_zero_surah}{with_zero_ayah}'
            ),
            translation,
            surah_name
        )

def set_information(verse_key, surah_name):
    [_, ayah] = verse_key.split("_")
    ayah_label.set_text(f'آیه {ayah} سوره {surah_name}')

def set_translation(verse_key, translation):
    [_, ayah] = verse_key.split("_")
    translation_label.set_text(f'{translation} ({ayah})')

def get_image(verse_key):
    image_url = f'{PIC_SOURCE}/{verse_key}.png'
    return urlopen(image_url)

def set_image(image):
    image_stream = Gio.MemoryInputStream.new_from_data(image.read(), None)
    image_pixbuf = Pixbuf.new_from_stream(image_stream, None)
    ayah_img.set_from_pixbuf(image_pixbuf)

def play_audio(url, name):
    path = f'./{name}.mp3'
    urlretrieve(url, path)
    playsound(path)
    remove(path)

# Logic of app
## Get information about ayah for today
ayah_for_this_day = load(urlopen(AYAH_API_URL))
(
    (split_verse_key, verse_key),
    translation,
    surah_name
) = get_verse_key(ayah_for_this_day)

## Showable things will download and present
set_information(split_verse_key, surah_name)
set_translation(split_verse_key, translation)
image = get_image(split_verse_key)
set_image(image)
gui.show()

## Download and play audios
play_audio(AOZOBILLAH, 'aozobillah')
play_audio(BISMILLAH, 'bismillah')
audio_url = f'{SOUND_SOURCE}/{verse_key}.mp3'
play_audio(audio_url, 'audio')
translation_url = f'{TRANSLATE_SOURCE}/{verse_key}.mp3'
play_audio(translation_url, 'translation')
tafsir_url = f'{TAFSIR_SOURCE}/{db()[verse_key]}.mp3'
play_audio(tafsir_url, 'tafsir')
