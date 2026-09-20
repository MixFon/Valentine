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
  chips: { heading: '', body: '' },
};

export interface DateOption {
  id: string;
  label: string;
}

export const dateOptions: DateOption[] = [
  { id: 'feb-14', label: '14 февраля' },
  { id: 'feb-23', label: '23 февраля' },
  { id: 'mar-8', label: '8 марта' },
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
