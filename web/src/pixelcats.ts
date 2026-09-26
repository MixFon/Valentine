// Пиксельные коты: стартовый экран, три шага и титры.
//
// Спрайт — массив строк, один символ — один пиксель, '.' — пусто.
// Цвет каждого символа — CSS-класс px-<символ> (pixelcats.css), сами
// цвета — токены --px-* в tokens.css. Кадры собираются в инлайн-SVG:
// соседние пиксели одного цвета в строке склеиваются в один <rect>.
//
// Анимация — смена кадров по таймлайну [кадр, мс]. У каждого спрайта
// есть фоновые циклы (loops) и разовые реакции (reactions): реакция
// прерывает цикл, отыгрывается один раз и возвращает кота в цикл.
// При prefers-reduced-motion кот стоит в первом кадре цикла и не
// реагирует.

import './pixelcats.css';

const SVG_NS = 'http://www.w3.org/2000/svg';

type Frame = string[];
type Timeline = [frame: number, ms: number][];

const SPRITES = {
  kishBed: [
    [
      '.............................L.....L..',
      '.............................L.....L..',
      '............................LKL...LKL.',
      '............................LKKLLLKKL.',
      '...........................LKKKKKKKKKL',
      '.............LLLLLLLLLLL...LKkKKKKKkKL',
      '..........LLLKKKKKKKKKkKLLLLKKKKKKKKKL',
      '.........LkkKkkKkkKKKkkkKKKkKKddKKddKK',
      '.....LLLLKKkKKkKKKkKKKKKKKKkKKyyKKyyKK',
      '....LKKKKKKKKkKkkKKKkKKKKKKkKKKKKKKKKK',
      '...LKKKKKkKKKKKKKKKKkKKKKKKKkKKKNNKKKL',
      '..LkKKkKKKkKKKKKKKkKKKKKkkKKKkKkKKKKL.',
      '..LKKKKkKKKKKKKKKKKKKKKKKkKKLKkKKKKKKL',
      '.LkKKKkkKKKKkKKKkKKkKKKKkKKLKKKKKKKKKK',
      '.LKkKKKKKLLLbKKKKKKKKkkKbbbbbbKKKKKKLL',
      'LkKKKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbL.',
      'LKKKKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbbL',
      '.LKKKKKLLLbbbbbbbbbbbbbbbbbbbbbbbbLLL.',
      'LKKKKkKL..LLLLLLLLLLLLLLLLLLLLLLLL....',
      'LkkKKKKL..............................',
      '.LkKkKL...............................',
      '..LKkL................................',
    ],
    [
      '.............................L.....L..',
      '.............................L.....L..',
      '............................LKL...LKL.',
      '............................LKKLLLKKL.',
      '...........................LKKKKKKKKKL',
      '.............LLLLLLLLLLL...LKkKKKKKkKL',
      '..........LLLKKKKKKKKKkKLLLLKKKKKKKKKL',
      '.........LkkKkkKkkKKKkkkKKKkKKKkKKKKKK',
      '.....LLLLKKkKKkKKKkKKKKKKKKkKKddKKddKK',
      '....LKKKKKKKKkKkkKKKkKKKKKKkKKKKKKKKKK',
      '...LKKKKKkKKKKKKKKKKkKKKKKKKkKKKNNKKKL',
      '..LkKKkKKKkKKKKKKKkKKKKKkkKKKkKkKKKKL.',
      '..LKKKKkKKKKKKKKKKKKKKKKKkKKLKkKKKKKKL',
      '.LkKKKkkKKKKkKKKkKKkKKKKkKKLKKKKKKKKKK',
      '.LKkKKKKKLLLbKKKKKKKKkkKbbbbbbKKKKKKLL',
      'LkKKKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbL.',
      'LKKKKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbbL',
      '.LKKKKKLLLbbbbbbbbbbbbbbbbbbbbbbbbLLL.',
      'LKKKKkKL..LLLLLLLLLLLLLLLLLLLLLLLL....',
      'LkkKKKKL..............................',
      '.LkKkKL...............................',
      '..LKkL................................',
    ],
    [
      '.............................L.....L..',
      '.............................L.....L..',
      '............................LKL...LKL.',
      '............................LKKLLLKKL.',
      '..............LLLLLLLLL....LKKKKKKKKKL',
      '...........LLLKKKKKKKKKLLL.LKkKKKKKkKL',
      '.........LLKKKKKKKKKkKkkKkLLKKKKKKKKKL',
      '........LkKkkKKKkkkKKKKKKkKkKKKkKKKKKK',
      '.....LLLKKKKkKKKKKKKKKKKKKKkKKddKKddKK',
      '....LKKkKkkKKKkKKKKKKKKKKKKkKKKKKKKKKK',
      '...LKKKKKkKKKKkKKKKKKKKKKkKKkKKKNNKKKL',
      '..LkKKkKKKKKkKKKKKkkKKkKKKKKKkKkKKKKL.',
      '..LKKKKKKkKKKKKKKKKkKKKKKKKkLKkKKKKKKL',
      '.LKKKkkKKKLkKKkKkKKkKKKKKKLLKKKKKKKKKK',
      '.LkKKKKKKLLLbbKKKKKKkkKbbbbbbbKKKKKKLL',
      'LKKKKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbL.',
      'LKKKKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbbL',
      '.LKKKKKLLLbbbbbbbbbbbbbbbbbbbbbbbbLLL.',
      'LKKKkKkL..LLLLLLLLLLLLLLLLLLLLLLLL....',
      'LkKKKKkL..............................',
      '.LkKkKL...............................',
      '..LKkL................................',
    ],
    [
      '.............................L.....L..',
      '.............................L.....L..',
      '............................LKL...LKL.',
      '............................LKKLLLKKL.',
      '...........................LKKKKKKKKKL',
      '.............LLLLLLLLLLL...LKkKKKKKkKL',
      '..........LLLKKKKKKKKKkKLLLLKKKKKKKKKL',
      '.........LkkKkkKkkKKKkkkKKKkKKKkKKKKKK',
      '.....LLLLKKkKKkKKKkKKKKKKKKkKKddKKddKK',
      '....LKKKKKKKKkKkkKKKkKKKKKKkKKKKKKKKKK',
      '...LKKKKKKKKKKKKKKKKkKKKKKKKkKKKNNKKKL',
      '..LkKKKKkKkKKKKKKKkKKKKKkkKKKkKkKKKKL.',
      '..LKKKKkKKKKKKKKKKKKKKKKKkKKLKkKKKKKKL',
      '..LKKKKkkKKKkKKKkKKkKKKKkKKLKKKKKKKKKK',
      '.LKKKKkKkLLLbKKKKKKKKkkKbbbbbbKKKKKKLL',
      '.LKKKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbL.',
      '.LkkKKKKbbbbbbbbbbbbbbbbbbbbbbbbbbbbbL',
      '.LKKKKKkLLbbbbbbbbbbbbbbbbbbbbbbbbLLL.',
      '.LkKKKKKL.LLLLLLLLLLLLLLLLLLLLLLLL....',
      '.LkKkKKKL.............................',
      '..LKKkKL..............................',
      '...LKkL...............................',
    ],
  ],
  iriskaSit: [
    [
      '..L............LL....',
      '.LBL..........LRL....',
      '.LBBL........LRRL....',
      '.LBBBL......LRRRL....',
      '.LBIBBLLLLLLRRIRL....',
      '.LBIIBRBBBBRRIIRL....',
      '.LBBRRRRRBBBBRRRL....',
      '..LBRRRRRBBRRRRL.....',
      '.LBBBBRBBBRRRRRRL....',
      '.LBBBBBBBBRRRRRRL....',
      '.LBBgPBBRRRRPgRRL....',
      '.LBBgPBRRRRRPgRRL....',
      '.LBBBBRRRCRRBRBBL....',
      '.LBBBBRCNNCRBBBBL....',
      '..LBBBBCCCCBBBBL.....',
      '...LBBBBCCCBBBL......',
      '..LBRRBBCCBBBBBL.....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBRBBL....',
      '.LBRRRRBCCBRRRRRL....',
      '.LCBRRBBBBBRRRRRL....',
      '.LCCBBBBBBBRRRRRLLL..',
      '..LCBBBBBBBRRRRRBBBL.',
      '...LBBBBBBBBBRRRRRBBL',
      '...LCCCCBBRRRBBBBBBBL',
      '...LCCCCLLRRRLLLLLLL.',
      '....LLLL..LLL........',
    ],
    [
      '..L............LL....',
      '.LBL..........LRL....',
      '.LBBL........LRRL....',
      '.LBBBL......LRRRL....',
      '.LBIBBLLLLLLRRIRL....',
      '.LBIIBRBBBBRRIIRL....',
      '.LBBRRRRRBBBBRRRL....',
      '..LBRRRRRBBRRRRL.....',
      '.LBBBBRBBBRRRRRRL....',
      '.LBBBBBBBBRRRRRRL....',
      '.LBBgPBBRRRRgPRRL....',
      '.LBBgPBRRRRRgPRRL....',
      '.LBBBBRRRCRRBRBBL....',
      '.LBBBBRCNNCRBBBBL....',
      '..LBBBBCCCCBBBBL.....',
      '...LBBBBCCCBBBL......',
      '..LBRRBBCCBBBBBL.....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBRBBL....',
      '.LBRRRRBCCBRRRRRL....',
      '.LCBRRBBBBBRRRRRL....',
      '.LCCBBBBBBBRRRRRLLL..',
      '..LCBBBBBBBRRRRRBBBL.',
      '...LBBBBBBBBBRRRRRBBL',
      '...LCCCCBBRRRBBBBBBBL',
      '...LCCCCLLRRRLLLLLLL.',
      '....LLLL..LLL........',
    ],
    [
      '.....................',
      '.....................',
      '.....................',
      '.....................',
      '.LLL..LLLLLL..LLL....',
      'LBBBLLRBBBBBLLRRRL...',
      'LBBBRRRRRBBBBRRRRL...',
      '.LLBRRRRRBBRRRRLL....',
      '.LBBBBRBBBRRRRRRL....',
      '.LBBggBBBBRRggRRL....',
      '.LBBgPBBRRRRPgRRL....',
      '.LBBgPBRRRRRPgRRL....',
      '.LBBBBRRRCRRBRBBL....',
      '.LBBBBRCNNCRBBBBL....',
      '..LBBBBCCCCBBBBL.....',
      '...LBBBBCCCBBBL......',
      '..LBRRBBCCBBBBBL.....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBRBBL....',
      '.LBRRRRBCCBRRRRRL....',
      '.LCBRRBBBBBRRRRRL....',
      '.LCCBBBBBBBRRRRRLLL..',
      '..LCBBBBBBBRRRRRBBBL.',
      '...LBBBBBBBBBRRRRRBBL',
      '...LCCCCBBRRRBBBBBBBL',
      '...LCCCCLLRRRLLLLLLL.',
      '....LLLL..LLL........',
    ],
    [
      '.LBL..........LRL....',
      '.LBBL........LRRL....',
      '.LBBBL......LRRRL....',
      '.LBIBBLLLLLLRRIRL....',
      '.LBIIBRBBBBRRIIRL....',
      '.LBBRRRRRBBBBRRRL....',
      '..LBRRRRRBBRRRRL.....',
      '.LBBBBRBBBRRRRRRL....',
      '.LBBggBBBBRRggRRL....',
      '.LBBgPBBRRRRPgRRL....',
      '.LBBgPBRRRRRPgRRL....',
      '.LBBBBRRRCRRBRBBL....',
      '.LBBBBRCNNCRBBBBL....',
      '..LBBBBCCCCBBBBL.....',
      '...LBBBBCCCBBBL......',
      '..LBRRBBCCBBBBBL.....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBBBBL....',
      '.LBRRRRCCCCBBRBBL....',
      '.LBRRRRBCCBRRRRRL....',
      '.LCBRRBBBBBRRRRRL....',
      '.LCCBBBBBBBRRRRRLLL..',
      '..LCBBBBBBBRRRRRBBBL.',
      '...LBBBBBBBBBRRRRRBBL',
      '...LCCCCBBRRRBBBBBBBL',
      '...LCCCCLLRRRLLLLLLL.',
      '....LLLL..LLL........',
      '.....................',
    ],
  ],
  chipsSit: [
    [
      '..LL..........L.......',
      '.LOOL........LOLLL....',
      '.LOOOLLLLLLLLOOLOOL...',
      '.LOIIOOOOOOOOIIOLOOL..',
      '.LIOOOOOaOaOOOOOLLOL..',
      'LOOOOOOOOaOOOOOOOLL...',
      '.LOOOOOOOOOOOOOOL.....',
      'LOOOOOOOOOOOOOOOOL....',
      'LOOOOOOOOOOOOOOOOL....',
      'LOOWPaOOOOOOWPaOOL....',
      'LOOaPaOOOOOOaPaOOL....',
      'LOOaaaWWWWWWaaaOOL....',
      '.LOOOOWWNNWWOOOOL.....',
      '.LOOOOWWWWWWOOOOL.....',
      '..LOOOOOOOOOOOOL......',
      '..LOOOOOOOOOOOOL......',
      '.LOOOWWWWWWWWOOOL.....',
      '.LOOOWWWWWWWWOOOL..L..',
      '.LOOOWWWWWWWWOOOL.LOL.',
      '.LOOOWWWWWWWWOOOLLOOOL',
      '.LOOOWWWWWWWWOOOLLOOOL',
      '.LOOOOWWWWWWOOOOOOOOOL',
      '..LOOOOWWWWOOOOOOOOOL.',
      '...LOWWOOOOWWOLLOOOL..',
      '...LWWWWOOWWWWL.LLL...',
      '....LLLLLLLLLL........',
    ],
    [
      '..LL..........L.......',
      '.LOOL........LOLLL....',
      '.LOOOLLLLLLLLOOLOOL...',
      '.LOIIOOOOOOOOIIOLOOL..',
      '.LIOOOOOaOaOOOOOLLOL..',
      'LOOOOOOOOaOOOOOOOLL...',
      '.LOOOOOOOOOOOOOOL.....',
      'LOOOOOOOOOOOOOOOOL....',
      'LOOOOOOOOOOOOONWNWL...',
      'LOOWPaOOOOOOWWWWWNL...',
      'LOOaPaOOOOOOaWWNNWL...',
      'LOOaaaWWWWWWaaWNNWL...',
      '.LOOOOWWNNWWOLWWWL....',
      '.LOOOOWWWWWWOLWWWL....',
      '..LOOOOOOOOOOLWWWL....',
      '..LOOOOOOOOOOLWWWL....',
      '.LOOOWWWWWWWWLWWWL....',
      '.LOOOWWWWWWWWLWWWL.L..',
      '.LOOOWWWWWWWWLWWL.LOL.',
      '.LOOOWWWWWWWWOOOLLOOOL',
      '.LOOOWWWWWWWWOOOLLOOOL',
      '.LOOOOWWWWWWOOOOOOOOOL',
      '..LOOOOWWWOOOOOOOOOOL.',
      '...LOWWOOOOOOOLLOOOL..',
      '...LWWWWOOOOOOL.LLL...',
      '....LLLLLLLLLL........',
    ],
    [
      '..LL..........L.......',
      '.LOOL........LOLLL....',
      '.LOOOLLLLLLLLOOLOOL...',
      '.LOIIOOOOOOOOIIOLOOL..',
      '.LIOOOOOaOaOOOOOLLOL..',
      'LOOOOOOOOaOOOOOOOLL...',
      '.LOOOOOOOOOOOOOOL.....',
      'LOOOOOOOOOOOOOOOOL....',
      'LOOOOOOOOOOOOOOOOL....',
      'LOOOOOOOOOOOOOOOOL....',
      'LOOLLLOOOOOOLLLOOL....',
      'LOOOOOWWWWWWOOOOOL....',
      '.LOOOOWWNNWWOOOOL.....',
      '.LOOOOWWWWWWOOOOL.....',
      '..LOOOOOOOOOOOOL......',
      '..LOOOOOOOOOOOOL......',
      '.LOOOWWWWWWWWOOOL.....',
      '.LOOOWWWWWWWWOOOL..L..',
      '.LOOOWWWWWWWWOOOL.LOL.',
      '.LOOOWWWWWWWWOOOLLOOOL',
      '.LOOOWWWWWWWWOOOLLOOOL',
      '.LOOOOWWWWWWOOOOOOOOOL',
      '..LOOOOWWWWOOOOOOOOOL.',
      '...LOWWOOOOWWOLLOOOL..',
      '...LWWWWOOWWWWL.LLL...',
      '....LLLLLLLLLL........',
    ],
  ],
  kishSleep: [
    [
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '...................L.....L..........',
      '..................LKL...LKL.........',
      '.........LLLLLL...LKKLLLKKL.........',
      '......LLLKKKkKKLLLLKKKKKKKL.........',
      '....LLKkKKKKKkKKKKLKKKKKKKL.........',
      '...LKKKKKKKKkKkKKKKKKKKKKKKL........',
      '..LKKKKKKkKKKKKKKKkkkKKkkKKL........',
      '.LKKKkKKKKKKKkKkKKkKKKKKKKKL........',
      '.LKKKKKKKKKKKKKKKKkKKKKKKKKL........',
      '.LKKKkKkKKKKKKkKKKKkkkkkkKL.........',
      '..LKKKKKKKKkKKKKKKkkkkkkkkL.........',
      '..LkkkkkkkKkkkkkKkkkkkkkkkL.........',
      '.LkKkkkkkkkkKkkkKkkkkkkkbbbLL.......',
      'LbbbkkkkKkkkkKkkkkkkkkbbbbbbbL......',
      '.LbbbbbbbbbbbbbbbbbbbbbbbbbbL.......',
      '..LLLbbbbbbbbbbbbbbbbbbbbLLL........',
    ],
    [
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '....................................',
      '...................L.....L..........',
      '.........LLLLLL...LKL...LKL..ZZ.....',
      '......LLLKKKkKKLLLLKKLLLKKL...Z.....',
      '....LLKkKKKKKkKKKKLKKKKKKKL...ZZ....',
      '...LKKKKKKKKkKkKKKKKKKKKKKL.........',
      '..LKKKKKKkKKKKKKKKKKKKKKKKKL........',
      '.LKKKKKKKKKKKkKkKKkkkKKkkKKL........',
      '.LKKKKKKKKKKKKKKKKkKKKKKKKKL........',
      '.LKKKkKkKKKKKKKKKKkKKKKKKKKL........',
      '.LKKKKKKKkkKKKKKKKKkkkkkkKL.........',
      '..LKKKKKKKkKKKKKKkkkkkkkkkL.........',
      '..LkkkkkkKkkkkkKkkkkkkkkkkL.........',
      '.LKkkkkkkkkKkkkKkkkkkkkkbbbLL.......',
      'LbbbkkkKkkkkKkkkkkkkkkbbbbbbbL......',
      '.LbbbbbbbbbbbbbbbbbbbbbbbbbbL.......',
      '..LLLbbbbbbbbbbbbbbbbbbbbLLL........',
    ],
    [
      '....................................',
      '....................................',
      '....................................',
      '................................ZZZZ',
      '..................................Z.',
      '.................................Z..',
      '...................L.....L...ZZ.ZZZZ',
      '..................LKL...LKL...Z.....',
      '.........LLLLLL...LKKLLLKKL...ZZ....',
      '......LLLKKKkKKLLLLKKKKKKKL.........',
      '....LLKkKKKKKkKKKKLKKKKKKKL.........',
      '...LKKKKKKKKkKkKKKKKKKKKKKKL........',
      '..LKKKKKKkKKKKKKKKkkkKKkkKKL........',
      '.LKKKkKKKKKKKkKkKKkKKKKKKKKL........',
      '.LKKKKKKKKKKKKKKKKkKKKKKKKKL........',
      '.LKKKkKkKKKKKKkKKKKkkkkkkKL.........',
      '..LKKKKKKKKkKKKKKKkkkkkkkkL.........',
      '..LkkkkkkkKkkkkkKkkkkkkkkkL.........',
      '.LkKkkkkkkkkKkkkKkkkkkkkbbbLL.......',
      'LbbbkkkkKkkkkKkkkkkkkkbbbbbbbL......',
      '.LbbbbbbbbbbbbbbbbbbbbbbbbbbL.......',
      '..LLLbbbbbbbbbbbbbbbbbbbbLLL........',
    ],
    [
      '....................................',
      '....................................',
      '................................ZZZZ',
      '..................................Z.',
      '.................................Z..',
      '.............................ZZ.ZZZZ',
      '.........................L....Z.....',
      '.........LLLLLL...L.....LKL...ZZ....',
      '......LLLKKKkKKLLLKLLLLLKKL.........',
      '....LLKkKKKKKkKKKKKKKKKKKKL.........',
      '...LKKKKKKKKkKkKKKKKKKKKKKL.........',
      '..LKKKKKKkKKKKKKKKKKKKKKKKKL........',
      '.LKKKKKKKKKKKkKkKKkkkKKkkKKL........',
      '.LKKKKKKKKKKKKKKKKkKKKKKKKKL........',
      '.LKKKkKkKKKKKKKKKKkKKKKKKKKL........',
      '.LKKKKKKKkkKKKKKKKKkkkkkkKL.........',
      '..LKKKKKKKkKKKKKKkkkkkkkkkL.........',
      '..LkkkkkkKkkkkkKkkkkkkkkkkL.........',
      '.LKkkkkkkkkKkkkKkkkkkkkkbbbLL.......',
      'LbbbkkkKkkkkKkkkkkkkkkbbbbbbbL......',
      '.LbbbbbbbbbbbbbbbbbbbbbbbbbbL.......',
      '..LLLbbbbbbbbbbbbbbbbbbbbLLL........',
    ],
    [
      '....................L.....L.........',
      '...................LKL...LKL........',
      '...................LKL...LKL........',
      '...................LKKLLLKKL........',
      '...................LKKKKKKKL........',
      '...................LKKKKKKKL........',
      '..................LKKddKddKKL.......',
      '..................LKKyyKyyKKL.......',
      '.........LLLLLL...LKKKKKKKKKL.......',
      '......LLLKKKkKKLLLLKKKKNKKKKL.......',
      '....LLKkKKKKKkKKKKLLKKKKKKKL........',
      '...LKKKKKKKKkKkKKKKKLKKKKKL.........',
      '..LKKKKKKkKKKKKKKKKKKLLLLL..........',
      '.LKKKkKKKKKKKkKkKKKKKkL.............',
      '.LKKKKKKKKKKKKKKKKKKKkL.............',
      '.LKKKkKkKKKKKKkKKKKKKKL.............',
      '..LKKKKKKKkkKKKKKKKKKL..............',
      '.LkkkkkkKkkKkkkkkKkkkkLLLLL.........',
      'LkKkkkkkKkkkkkkkkkKkkkkbbbbLL.......',
      'LbbkkkkkkkkkkkkkkkkkkbbbbbbbbL......',
      '.LbbbbbbbbbbbbbbbbbbbbbbbbbbL.......',
      '..LLLbbbbbbbbbbbbbbbbbbbbLLL........',
    ],
    [
      '....................L.....L.........',
      '...................LKL...LKL........',
      '...................LKL...LKL........',
      '...................LKKLLLKKL........',
      '...................LKKKKKKKL........',
      '...................LKKKKKKKL........',
      '..................LKKKKKKKKKL.......',
      '..................LKKyPKyPKKL.......',
      '.........LLLLLL...LKKKKKKKKKL.......',
      '......LLLKKKkKKLLLLKKKKNKKKKL.......',
      '....LLKkKKKKKkKKKKLLKKKKKKKL........',
      '...LKKKKKKKKkKkKKKKKLKKKKKL.........',
      '..LKKKKKKkKKKKKKKKKKKLLLLL..........',
      '.LKKKkKKKKKKKkKkKKKKKkL.............',
      '.LKKKKKKKKKKKKKKKKKKKkL.............',
      '.LKKKkKkKKKKKKkKKKKKKKL.............',
      '..LKKKKKKKkkKKKKKKKKKL..............',
      '.LkkkkkkKkkKkkkkkKkkkkLLLLL.........',
      'LkKkkkkkKkkkkkkkkkKkkkkbbbbLL.......',
      'LbbkkkkkkkkkkkkkkkkkkbbbbbbbbL......',
      '.LbbbbbbbbbbbbbbbbbbbbbbbbbbL.......',
      '..LLLbbbbbbbbbbbbbbbbbbbbLLL........',
    ],
  ],
  iriskaCrouch: [
    [
      '.............................',
      '.............................',
      '.............................',
      '....L........................',
      '...LBL.......................',
      '..LBRRL......................',
      '..LRRRL............L......L..',
      '.LBRRRRL............L....L...',
      '.LBBRRBL...........LBL..LRL..',
      '.LBBBBBL...........LIBLLRIL..',
      '.LBBBBBL...........LIIBRIIL..',
      '.LBBBBBL...LLLL...LBBBBBRRBL.',
      '..LBBBLLLLLBBBBLLLLBBgPRgPRL.',
      '..LBBBLRRRRBBBBBRRBBBBBRRRRL.',
      '...LBBRRRRRRBBBRRRRBBBCNRRBL.',
      '...LBBRRRRRRBBBBRRBBBCCCCBBL.',
      '...LBBBRRRRBBCCCCBBBBBBBBBL..',
      '....LBBBBBBBCCCCCCBBBLLLLL...',
      '.....LBBBBBBBCCCCBBBBL.......',
      '.....LBBLCCBBBBLBBLCCL.......',
      '.....LBBLCCLLLLLBBLCCL.......',
      '......LL.LL.....LL.LL........',
      '.............................',
    ],
    [
      '.............................',
      '.............................',
      '.............................',
      '....L........................',
      '...LBL.......................',
      '..LBRRL......................',
      '..LRRRL............L......L..',
      '.LBRRRRL............L....L...',
      '.LBBRRBL...........LBL..LRL..',
      '.LBBBBBL...........LIBLLRIL..',
      '.LBBBBBL...........LIIBRIIL..',
      '.LBBBBBL...LLLL...LBBBBBRRBL.',
      '..LBBBLLLLLBBBBLLLLBBPgRPgRL.',
      '..LBBBLRRRRBBBBBRRBBBBBRRRRL.',
      '...LBBRRRRRRBBBRRRRBBBCNRRBL.',
      '...LBBRRRRRRBBBBRRBBBCCCCBBL.',
      '...LBBBRRRRBBCCCCBBBBBBBBBL..',
      '....LBBBBBBBCCCCCCBBBLLLLL...',
      '.....LBBBBBBBCCCCBBBBL.......',
      '.....LBBLCCBBBBLBBLCCL.......',
      '.....LBBLCCLLLLLBBLCCL.......',
      '......LL.LL.....LL.LL........',
      '.............................',
    ],
    [
      '.............................',
      '.............................',
      '.............................',
      '....L........................',
      '...LBL.......................',
      '..LBRRL......................',
      '..LRRRL......................',
      '.LBRRRRL.....................',
      '.LBBRRBL.....................',
      '.LBBBBBL..........LLLLLLLLLL.',
      '.LBBBBBL.........LBBBBBBRRRRL',
      '.LBBBBBL...LLLL..LBBBBBBRRRRL',
      '..LBBBLLLLLBBBBLLLLBBgPRPgRL.',
      '..LBBBLRRRRBBBBBRRBBBBBRRRRL.',
      '...LBBRRRRRRBBBRRRRBBBCNRRBL.',
      '...LBBRRRRRRBBBBRRBBBCCCCBBL.',
      '...LBBBRRRRBBCCCCBBBBBBBBBL..',
      '....LBBBBBBBCCCCCCBBBLLLLL...',
      '.....LBBBBBBBCCCCBBBBL.......',
      '.....LBBLCCBBBBLBBLCCL.......',
      '.....LBBLCCLLLLLBBLCCL.......',
      '......LL.LL.....LL.LL........',
      '.............................',
    ],
    [
      '.............................',
      '.............................',
      '.............................',
      '.............................',
      '....L........................',
      '...LBL.......................',
      '..LBRRL......................',
      '..LRRRL......................',
      '.LBRRRRL.....................',
      '.LBBRRBL.....................',
      '.LBBBBBL..........LLLLLLLLLL.',
      '.LBBBBBL.........LBBBBBBRRRRL',
      '.LBBBBBL...LLLL..LBBBBBBRRRRL',
      '..LBBBLLLLLBBBBLLLLBBBBRRRRL.',
      '..LBBBLRRRRBBBBBRRBBBgPRgPRL.',
      '...LBBRRRRRRBBBRRRRBBBCCRRBL.',
      '...LBBRRRRRRBBBBRRBBBCCNCBBL.',
      '...LBBBRRRRBBCCCCBBBBBBBBBL..',
      '....LBBBBBBBCCCCCCBBBLLLLL...',
      '.....LBBBBBBBCCCCBBBBL.......',
      '.....LBBLCCBBBBLBBLCCL.......',
      '.....LBBLCCLLLLLBBLCCL.......',
      '......LL.LL.....LL.LL........',
    ],
    [
      '...LLL.......................',
      '..LBBBL......................',
      '..LBRRLL.....................',
      '.LLRRRRL.....................',
      '.LBRRRRL.....................',
      '.LBRRRRL.....................',
      'LBBRRRRBL....................',
      'LLBBRRBBL.........LLLLLLLLLL.',
      'LBBBBBBBL........LBBBBBBRRRRL',
      '.LBBBBBL...LLLL..LBBBggBggRRL',
      '.LBBBBBLLLLBBBBLLLLBBgPRPgRL.',
      '.LBBBBBRRRRBBBBBRRBBBBBRRRRL.',
      '..LBBBRRRRRRBBBRRRRBBBCNRRBL.',
      '..LBBBRRRRRRBBBBRRBBBCCCCBBL.',
      '...LBBBRRRRBBCCCCBBBBBBBBBL..',
      '....LBBBBBBBCCCCCCBBBLLLLL...',
      '.....LBBBBBBBCCCCBBBBL.......',
      '.....LBBLCCBBBBLBBLCCL.......',
      '.....LBBLCCLLLLLBBLCCL.......',
      '......LL.LL.....LL.LL........',
      '.............................',
      '.............................',
      '.............................',
    ],
  ],
  chipsHands: [
    [
      '...........................',
      '...........................',
      '...........................',
      '......LL..........L........',
      '.....LOOL........LOLLL.....',
      '.....LOOOLLLLLLLLOOLOOL....',
      '.....LOIIOOOOOOOOIIOLOOL...',
      '.....LIOOOOOaOaOOOOOLLOL...',
      '....LOOOOOOOOaOOOOOOOLL....',
      '.....LOOOOOOOOOOOOOOL......',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOWPaOOOOOOWPaOOL.....',
      '....LOOaPaOOOOOOaPaOOL.....',
      '....LOOaaaWWWWWWaaaOOL.....',
      '.....LOOOOWWNNWWOOOOL......',
      '.....LOOOOWWWWWWOOOOL......',
      '......LOOOOOOOOOOOOL.......',
      '......LOOOOOOOOOOOOL.......',
      '.....LOOOWWWWWWWWOOOL......',
      '.....LOOOWWWWWWWWOOOL..L...',
      '..L..LOOOWWWWWWWWOOOL.LOL..',
      '.LHLLLOOOWWWWWWWWOOOLLOHOL.',
      '.LHLHLOOOWWWWWWWWOOOLHOHOL.',
      'LHHHHLHOOOWWWWWWOOOHOHHHHL.',
      '.LHHHHHOOOOWWWWOOOOHHHHHL..',
      '.LHhHHHHHHHHHHHHHHHHHHhHL..',
      'LHHHHhHHHHHHHHHHHHHHhHHHHL.',
      'LHHHHHHHHHHHHHHHHHHHHHHHHL.',
      '.LLHHHHHHHHHHHHHHHHHHHHLL..',
      '...LLLLLLLLLLLLLLLLLLLL....',
    ],
    [
      '...........................',
      '...........................',
      '...........................',
      '......LL..........L........',
      '.....LOOL........LOLLL.....',
      '.....LOOOLLLLLLLLOOLOOL....',
      '.....LOIIOOOOOOOOIIOLOOL...',
      '.....LIOOOOOaOaOOOOOLLOL...',
      '....LOOOOOOOOaOOOOOOOLL....',
      '.....LOOOOOOOOOOOOOOL......',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOLLLOOOOOOLLLOOL.....',
      '....LOOOOOWWWWWWOOOOOL.....',
      '.....LOOOOWWNNWWOOOOL......',
      '.....LOOOOWWWWWWOOOOL......',
      '......LOOOOOOOOOOOOL.......',
      '......LOOOOOOOOOOOOL.......',
      '.....LOOOWWWWWWWWOOOL......',
      '.....LOOOWWWWWWWWOOOL..L...',
      '..L..LOOOWWWWWWWWOOOL.LOL..',
      '.LHLLLOOOWWWWWWWWOOOLLOHOL.',
      '.LHLHLOOOWWWWWWWWOOOLHOHOL.',
      'LHHHHLHOOOWWWWWWOOOHOHHHHL.',
      '.LHHHHHOOOOWWWWOOOOHHHHHL..',
      '.LHhHHHHHHHHHHHHHHHHHHhHL..',
      'LHHHHhHHHHHHHHHHHHHHhHHHHL.',
      'LHHHHHHHHHHHHHHHHHHHHHHHHL.',
      '.LLHHHHHHHHHHHHHHHHHHHHLL..',
      '...LLLLLLLLLLLLLLLLLLLL....',
    ],
    [
      '...........................',
      '...........................',
      '...........................',
      '......LL..........L........',
      '.....LOOL........LOLLL.....',
      '.....LOOOLLLLLLLLOOLOOL....',
      '.....LOIIOOOOOOOOIIOLOOL...',
      '.....LIOOOOOaOaOOOOOLLOL...',
      '....LOOOOOOOOaOOOOOOOLL....',
      '.....LOOOOOOOOOOOOOOL......',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOWPaOOOOOOWPaOOL.....',
      '....LOOaPaOOOOOOaPaOOL.....',
      '....LOOaaaWWWWWWaaaOOL.....',
      '.....LOOOOWWNNWWOOOOL......',
      '.....LOOOOWWWWWWOOOOL......',
      '......LOOOOOOOOOOOOL.......',
      '......LOOOOOOOOOOOOL.......',
      '.....LOOOWWWWWWWWOOOL......',
      '.....LOOOWWWWWWWWOOOL..LLL.',
      '..L..LOOOWWWWWWWWOOOL.LOOOL',
      '.LHLLLOOOWWWWWWWWOOOLLLHOOL',
      '.LHLHLOOOWWWWWWWWOOOLHLHOOL',
      'LHHHHLHOOOWWWWWWOOOHOHHHHOL',
      '.LHHHHHOOOOWWWWOOOOHHHHHLL.',
      '.LHhHHHHHHHHHHHHHHHHHHhHL..',
      'LHHHHhHHHHHHHHHHHHHHhHHHHL.',
      'LHHHHHHHHHHHHHHHHHHHHHHHHL.',
      '.LLHHHHHHHHHHHHHHHHHHHHLL..',
      '...LLLLLLLLLLLLLLLLLLLL....',
    ],
    [
      '...........................',
      '......................Q.Q..',
      '.....................QQQQQ.',
      '......LL..........L..QQQQQ.',
      '.....LOOL........LOLLLQQQ..',
      '.....LOOOLLLLLLLLOOLOOLQ...',
      '.....LOIIOOOOOOOOIIOLOOL...',
      '.....LIOOOOOaOaOOOOOLLOL...',
      '....LOOOOOOOOaOOOOOOOLL....',
      '.....LOOOOOOOOOOOOOOL......',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOWPaOOOOOOWPaOOL.....',
      '....LOOaPaOOOOOOaPaOOL.....',
      '....LOOaaaWWWWWWaaaOOL.....',
      '.....LOOOOWWNNWWOOOOL......',
      '.....LOOOOWWWWWWOOOOL......',
      '......LOOOOOOOOOOOOL.......',
      '......LOOOOOOOOOOOOL.......',
      '.....LOOOWWWWWWWWOOOL......',
      '.....LOOOWWWWWWWWOOOL..L...',
      '..L..LOOOWWWWWWWWOOOL.LOL..',
      '.LHLLLOOOWWWWWWWWOOOLLOHOL.',
      '.LHLHLOOOWWWWWWWWOOOLHOHOL.',
      'LHHHHLHOOOWWWWWWOOOHOHHHHL.',
      '.LHHHHHOOOOWWWWOOOOHHHHHL..',
      '.LHhHHHHHHHHHHHHHHHHHHhHL..',
      'LHHHHhHHHHHHHHHHHHHHhHHHHL.',
      'LHHHHHHHHHHHHHHHHHHHHHHHHL.',
      '.LLHHHHHHHHHHHHHHHHHHHHLL..',
      '...LLLLLLLLLLLLLLLLLLLL....',
    ],
    [
      '......................Q.Q..',
      '.....................QQQQQ.',
      '.....................QQQQQ.',
      '......LL..........L...QQQ..',
      '.....LOOL........LOLLL.Q...',
      '.....LOOOLLLLLLLLOOLOOL....',
      '.....LOIIOOOOOOOOIIOLOOL...',
      '.....LIOOOOOaOaOOOOOLLOL...',
      '....LOOOOOOOOaOOOOOOOLL....',
      '.....LOOOOOOOOOOOOOOL......',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOOOOOOOOOOOOOOOL.....',
      '....LOOLLLOOOOOOLLLOOL.....',
      '....LOOOOOWWWWWWOOOOOL.....',
      '.....LOOOOWWNNWWOOOOL......',
      '.....LOOOOWWWWWWOOOOL......',
      '......LOOOOOOOOOOOOL.......',
      '......LOOOOOOOOOOOOL.......',
      '.....LOOOWWWWWWWWOOOL......',
      '.....LOOOWWWWWWWWOOOL..L...',
      '..L..LOOOWWWWWWWWOOOL.LOL..',
      '.LHLLLOOOWWWWWWWWOOOLLOHOL.',
      '.LHLHLOOOWWWWWWWWOOOLHOHOL.',
      'LHHHHLHOOOWWWWWWOOOHOHHHHL.',
      '.LHHHHHOOOOWWWWOOOOHHHHHL..',
      '.LHhHHHHHHHHHHHHHHHHHHhHL..',
      'LHHHHhHHHHHHHHHHHHHHhHHHHL.',
      'LHHHHHHHHHHHHHHHHHHHHHHHHL.',
      '.LLHHHHHHHHHHHHHHHHHHHHLL..',
      '...LLLLLLLLLLLLLLLLLLLL....',
    ],
  ],
} satisfies Record<string, Frame[]>;

export type SpriteId = keyof typeof SPRITES;

interface Animation {
  loops: Record<string, Timeline>;
  reactions?: Record<string, Timeline>;
}

const ANIMATIONS: Record<SpriteId, Animation> = {
  // Старт. 0 — смотрит одним глазом, 1 — закрыл, 2 — вдох, 3 — ведёт хвостом.
  kishBed: {
    loops: {
      idle: [[0, 2600], [1, 900], [2, 1100], [1, 1100], [2, 1100], [1, 900], [3, 800], [1, 1400]],
    },
  },
  // Старт. 0 — сидит, 1 — косится, 2 — прижала уши, 3 — подпрыгнула.
  iriskaSit: {
    loops: {
      idle: [[0, 900], [1, 180], [0, 260], [1, 160], [0, 1300], [2, 150], [3, 150], [2, 180], [0, 700], [1, 200]],
    },
  },
  // Старт. 0 — сидит, 1 — лапка поднята, 2 — моргнул.
  chipsSit: {
    loops: {
      idle: [[0, 1800], [1, 700], [0, 350], [1, 700], [0, 1600], [2, 300], [0, 1400]],
    },
  },
  // Шаг 1. 0 — спит, 1 — вдох и «z», 2 — «z-Z», 3 — вдох и дёрнул ухом,
  // 4 — приоткрыл глаза, 5 — проснулся и поднял голову.
  kishSleep: {
    loops: {
      idle: [[0, 1400], [1, 1400], [2, 1400], [0, 1400], [1, 1400], [3, 900], [0, 1400], [2, 1400]],
    },
    reactions: {
      wake: [[4, 250], [5, 1700], [4, 450], [0, 700]],
    },
  },
  // Шаг 2. 0 — косится вправо, 1 — влево, 2 — прижала уши, 3 — пригнулась,
  // 4 — вздрогнула: подскок, хвост дыбом.
  iriskaCrouch: {
    loops: {
      idle: [[0, 700], [1, 200], [0, 500], [1, 160], [0, 900], [2, 180], [3, 450], [2, 160], [0, 800]],
    },
    reactions: {
      startle: [[4, 240], [2, 160], [3, 380], [2, 160]],
    },
  },
  // Шаг 3. 0 — сидит на руках, 1 — моргнул, 2 — повёл хвостом,
  // 3 — сердечко, 4 — сердечко выше и довольный прищур.
  chipsHands: {
    loops: {
      idle: [[0, 1800], [2, 500], [0, 500], [2, 500], [0, 1600], [1, 300], [0, 1200]],
      happy: [[3, 700], [4, 700], [3, 700], [4, 700], [1, 300]],
    },
  },
};

export interface PixelCat {
  el: SVGSVGElement;
  // Разовая реакция поверх цикла. Если такой у спрайта нет — ничего.
  react(name: string): void;
}

export function renderPixelCat(id: SpriteId, loop = 'idle'): PixelCat {
  const frames: Frame[] = SPRITES[id];
  const width = frames[0][0].length;
  const height = frames[0].length;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('pixelcat', `pixelcat--${id}`);
  svg.style.setProperty('--px-w', String(width));
  svg.style.setProperty('--px-h', String(height));

  const animation = ANIMATIONS[id];
  const timeline = animation.loops[loop] ?? animation.loops.idle;
  // Стоп-кадр — первый кадр цикла: у довольного Чипса это сердечко.
  const first = timeline[0][0];

  const groups = frames.map((frame, index) => {
    const g = document.createElementNS(SVG_NS, 'g');
    if (index !== first) g.setAttribute('visibility', 'hidden');
    appendRects(g, frame);
    svg.append(g);
    return g;
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const player = new Player(svg, groups, timeline, first);
  if (!reduced) player.start();

  return {
    el: svg,
    react(name) {
      const reaction = animation.reactions?.[name];
      if (reaction && !reduced) player.playOnce(reaction);
    },
  };
}

function appendRects(g: SVGGElement, frame: Frame): void {
  frame.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end += 1;
      if (ch !== '.') {
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', String(x));
        rect.setAttribute('y', String(y));
        rect.setAttribute('width', String(end - x));
        rect.setAttribute('height', '1');
        rect.setAttribute('class', `px-${ch}`);
        g.append(rect);
      }
      x = end;
    }
  });
}

class Player {
  private timeline: Timeline;
  private once = false;
  private step = 0;
  private timer = 0;

  constructor(
    private readonly svg: SVGSVGElement,
    private readonly groups: SVGGElement[],
    private readonly loop: Timeline,
    private shown: number,
  ) {
    this.timeline = loop;
  }

  start(): void {
    // Первый тик — после вставки в документ.
    this.timer = window.setTimeout(() => this.tick(), 0);
  }

  playOnce(timeline: Timeline): void {
    window.clearTimeout(this.timer);
    this.timeline = timeline;
    this.once = true;
    this.step = 0;
    this.tick();
  }

  private tick(): void {
    // Экран сменился — кот больше не в документе, таймер не продлеваем.
    if (!this.svg.isConnected) return;

    if (this.step >= this.timeline.length) {
      this.step = 0;
      if (this.once) {
        this.once = false;
        this.timeline = this.loop;
      }
    }

    const [frame, ms] = this.timeline[this.step];
    this.show(frame);
    this.step += 1;
    this.timer = window.setTimeout(() => this.tick(), ms);
  }

  private show(frame: number): void {
    if (frame === this.shown) return;
    this.groups[this.shown].setAttribute('visibility', 'hidden');
    this.groups[frame].removeAttribute('visibility');
    this.shown = frame;
  }
}
