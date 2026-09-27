// Единственный источник копирайта. Ни одной строки текста в разметке
// или компонентах — всё подключается по ключу отсюда.
//
// Тексты, даты и форматы кладёт автор проекта. Сейчас здесь только
// структура, которую ждут шаги — реальный контент не выдумываем.

export type CatId = 'kish' | 'iriska' | 'chips';

export interface StepCopy {
  heading: string;
  body: string;
}

export const steps: Record<CatId, StepCopy> = {
  kish: {
    heading: 'Киш редко встаёт с лежанки.',
    body: 'Но ради такого — встал. Выбирай день.',
  },
  iriska: {
    heading: 'Ириска перепробовала все варианты',
    body: 'и ни один её не устроил. Попробуй ты.',
  },
  chips: {
    heading: 'Чипс сверяет билет.',
    body: 'Всё по плану — дата и формат ниже. Подтверждаешь?',
  },
};

// Стартовый экран — до трёх шагов.
export const introCopy = {
  heading: 'Тебя зовут на свидание.',
  body: 'Три кота всё подготовили и зададут по вопросу: Киш — про день, Ириска — про формат, Чипс проверит, что всё сходится. Это пара минут.',
  start: 'Выбрать день',
  catsLabel: 'Киш, Ириска и Чипс',
};

export interface DateOption {
  id: string;
  label: string;
  // День и месяц — для расчёта ближайшего года при экспорте в .ics.
  // Год не показываем на карточке (см. DECISIONS.md).
  day: number;
  month: number;
}

export const dateOptions: DateOption[] = [
  { id: 'oct-2', label: '2 октября', day: 2, month: 10 },
  { id: 'oct-9', label: '9 октября', day: 9, month: 10 },
  { id: 'oct-10', label: '10 октября', day: 10, month: 10 },
];

// Своя дата — обязательный четвёртый вариант, если ни один из
// готовых не подходит. Кнопка открывает нативный <input type="date">.
export const customDateCopy = {
  cardLabel: 'Указать самой',
  inputLabel: 'Своя дата',
  submit: 'Выбрать',
};

export type FormatIcon =
  | 'dinner'
  | 'movie'
  | 'park'
  | 'pottery'
  | 'cabin'
  | 'planetarium'
  | 'custom';

export interface FormatOption {
  id: string;
  // Уходит на сервер и печатается на билете Чипса.
  label: string;
  // Реплика Ириски в облачке, когда карточку тронули: почему её не
  // устроил и этот вариант.
  worry: string;
  icon: FormatIcon;
}

// Черновик, собранный вместе с автором: конкретные осенние варианты
// вместо общих категорий. Автор может переписать любую строку.
export const formatOptions: FormatOption[] = [
  {
    id: 'dinner',
    label: 'ужин там, куда давно собирались',
    worry: '«А вдруг там громко и все смотрят?»',
    icon: 'dinner',
  },
  {
    id: 'movie',
    label: 'ночной сеанс в кино',
    worry: '«Темно. И кто-то хрустит.»',
    icon: 'movie',
  },
  {
    id: 'park',
    label: 'осенний парк с термосом какао',
    worry: '«Листья шуршат. Подозрительно.»',
    icon: 'park',
  },
  {
    id: 'pottery',
    label: 'гончарный мастер-класс на двоих',
    worry: '«Глина. Липкая. Нет.»',
    icon: 'pottery',
  },
  {
    id: 'cabin',
    label: 'домик с камином и баней',
    worry: '«Огонь?! Ну, если только издалека.»',
    icon: 'cabin',
  },
  {
    id: 'planetarium',
    label: 'планетарий',
    worry: '«Там же космос. Он огромный.»',
    icon: 'planetarium',
  },
];

// Свой вариант — как «Указать самой» у Киша: карточка открывает поле.
export const customFormatCopy = {
  cardLabel: 'свой вариант',
  worry: '«Вдруг ты придумаешь то, что меня устроит?»',
  inputLabel: 'Свой вариант',
  placeholder: 'например, первый каток сезона',
  submit: 'Выбрать',
};

export const chipsCopy = {
  confirmButton: 'Договориться',
  sending: 'Договариваюсь…',
  error: 'Не получилось отправить. Попробуй ещё раз.',
  confirmedHeading: 'Чипс замурчал. Это его подпись.',
  confirmedBody: 'Значит, договорились.',
  calendarButton: 'Добавить в календарь',
  creditsButton: 'В разработке участвовали',
  // Ответ уже ушёл, но планы могли поменяться: кнопка возвращает
  // к билету, откуда можно дойти до любого шага и отправить заново.
  changeAnswer: 'Изменить ответ',
};

// Возврат на шаг назад. Кнопка называет, куда ведёт.
export const backCopy = {
  kish: '← К приглашению',
  iriska: '← К выбору дня',
  chips: '← К выбору формата',
};

// Пасхалка на экране Киша: тап по спящему коту будит его.
export const kishCopy = {
  wakeLabel: 'Разбудить Киша',
};

// Титры после подтверждения — как после фильма.
export const creditsCopy = {
  heading: 'В разработке участвовали',
  cast: {
    kish: { name: 'Киш', role: 'в роли того, кто встал с лежанки' },
    iriska: { name: 'Ириска', role: 'в роли той, кого ничего не устроило' },
    chips: { name: 'Чипс', role: 'в роли того, кто всё скрепил' },
  } satisfies Record<CatId, { name: string; role: string }>,
  final: 'Спасибо, что досмотрела.',
  back: 'Вернуться к билету',
};

// Черновики — автор может переписать.
export const photoAlt: Record<CatId, string> = {
  kish: 'Киш лежит на лежанке и смотрит одним глазом.',
  iriska: 'Ириска свернулась на пледе и следит за тобой.',
  chips: 'Чипс сидит на кровати и поднял лапу.',
};

export const audioCopy = {
  muteLabel: 'Выключить звук',
  unmuteLabel: 'Включить звук',
};
