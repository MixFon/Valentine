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
  { id: 'feb-14', label: '14 февраля', day: 14, month: 2 },
  { id: 'feb-23', label: '23 февраля', day: 23, month: 2 },
  { id: 'mar-8', label: '8 марта', day: 8, month: 3 },
];

// Своя дата — обязательный четвёртый вариант, если ни один из
// готовых не подходит. Кнопка открывает нативный <input type="date">.
export const customDateCopy = {
  cardLabel: 'Указать самой',
  inputLabel: 'Своя дата',
  submit: 'Выбрать',
};

export interface FormatOption {
  id: string;
  label: string;
}

export const formatOptions: FormatOption[] = [
  { id: 'dinner', label: 'ужин' },
  { id: 'movie', label: 'кино' },
  { id: 'walk', label: 'прогулка' },
  { id: 'masterclass', label: 'мастеркласс' },
  { id: 'nature', label: 'выезд на природу' },
  { id: 'cabin', label: 'выезд в домик' },
];

export const chipsCopy = {
  confirmButton: 'Договориться',
  sending: 'Договариваюсь…',
  error: 'Не получилось отправить. Попробуй ещё раз.',
  confirmedHeading: 'Чипс уже сел на руки и никого не отпускает.',
  confirmedBody: 'Значит, договорились.',
  calendarButton: 'Добавить в календарь',
  creditsButton: 'В разработке участвовали',
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
