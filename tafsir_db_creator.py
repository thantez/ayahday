import re;
from urllib.request import urlopen

TAFSIR_SOURCE = 'https://dl.salamquran.com/ayat/qaraati.fa.qaraati-tafsir-16/'

dict = {}

pattern = '[0-9]+(-?([0-9]+))\.mp3'
data_list = urlopen(TAFSIR_SOURCE).read().decode('utf-8')
captured_data = re.finditer(pattern, data_list)
for match in captured_data:
    line = data_list[match.start():match.end()].replace('.mp3', '')
    if '-' in line:
        [astart, end] = line.split('-')
        sura = astart[:3]
        start = astart[3:]
        int_start = int(start)
        while int_start <= int(end):
            dict[f'{sura}{str(int_start).zfill(3)}'] = line
            int_start = int_start + 1
    else:
        dict[line] = line

print(len(dict))
