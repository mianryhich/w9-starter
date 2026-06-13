// # Общие типы

// Координаты, для удобства переименованы чтобы не путать.
export type XAxis = number; 
export type YAxis = number;
export type Point = [XAxis, YAxis];

// Но если нужно обеспечить "жесткую" несовместимость, 
// можно сделать "брендированными"
// export type X = number & { __brand: "X"};
// export type Y = number & { __brand: "Y"};
// export const xy = (x: number, y: number): Point => [x as X, y as Y];

export type Size = number;

// Фигура это набор точек
export type Shape = Point[];
// Но можно сделать ее шаблон в виде функции,
// которая будет считать точки относительно стартовой
export type ShapeGenerator = (x: XAxis, y: YAxis) => Shape;

// # Типы для бизнес-логики
// Срезы состояний для удобства работы
export type CellInitial = CellState.EMPTY | CellState.SHIP;
export type CellResult = CellState.MISSED | CellState.SINKED;

// Основные настройки описывающие игру
export interface GameSettings {
  width: number; // ширина поля
  height: number; // высота поля
  fleet: number[][]; // [[количество, и размеры], ...кораблей]
}

// # Дальше описываем наш UI

// все виджеты рендерятся в какой-то контейнер
// к нему можно обратиться и, например, 
// добавить в другой контейнер
export interface IComponent {
  container: HTMLElement
}

// Типизируем события
// Эмиттер везде передаем как инстанс, для него укажем интерфейс
export interface IEvents {
  on<T extends object>(event: string, callback: (data: T) => void): void;
  emit<T extends object>(event: string, data?: T): void;
  trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

// Все события
export enum Events {
  TEST = 'ui:test'
};

// И описываем данные этих событий
