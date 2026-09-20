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
  kish: { heading: '', body: '' },
  iriska: { heading: '', body: '' },
  chips: { heading: '', body: '' },
};

export interface DateOption {
  id: string;
  label: string;
}

export const dateOptions: DateOption[] = [];

export interface FormatOption {
  id: string;
  label: string;
}

export const formatOptions: FormatOption[] = [];
