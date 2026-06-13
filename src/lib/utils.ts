import type { XAxis, YAxis, Point, Shape, ShapeGenerator } from "./types";

// Вычисляемое значение = функция или значение
// @bug https://github.com/microsoft/TypeScript/issues/37663
export type CalculatedValue<T> = T extends Function ? never : T | ((prev?: T, index?: number) => T);

// Получить значение, каким бы оно ни было
export function getValue<T>(value: CalculatedValue<T>, prevValue?: T, index?: number): T {
  if (typeof value === "function") return value(prevValue, index);
  else return value as T;
}

/**
 * Заполняет массив указанным значением
 * @param size
 * @param value
 */
export function fillArray<T>(size: number, value: CalculatedValue<T>) {
  const result: T[] = [];
  for (let i = 0; i < size; i++) result.push(getValue(value, undefined, i));
  return result;
}

/**
 * Вычисляем индекс в плоском массиве по 2D-координатам
 * @param x
 * @param y
 * @param width при вычислении нас только одна сторона интересует
 */
export function index(x: number, y: number, width: number): number {
  return y * width + x;
}

/**
 * Вычисляем координаты по индексу
 * @param index индекс в плоском массиве вида [1,2,3,4,5...]
 * @param width
 */
export function axis2D(index: number, width: number): Point {
  return [index % width, Math.floor(index / width)];
}

/**
 * Проверяем на вхождение в диапазон от и до включительно
 */
export function inRange(v: number, min: number, max: number): boolean {
  return v >= min && v <= max;
}

/**
 * Создаем функцию генератор фигур
 */
export function shape(points: Shape): ShapeGenerator {
  // по факту плюсуем относительные координаты точек с координатами старта отчета
  return (x: XAxis, y: YAxis) => points.map(([dx, dy]) => [x + dx, y + dy]);
}

/**
 * Самая простая фигура линия из точек заданного размера и направления
 * Но назовем прямоугольник...
 */
export function rectangle(size: number, isVertical: boolean): ShapeGenerator;
export function rectangle(width: number, height: number, isVertical: boolean): ShapeGenerator;
export function rectangle(...args: unknown[]): ShapeGenerator {
  if (args.length === 2) {
    const size = args[0] as number;
    const isVertical = (args[1] as boolean) ?? false;
    const points: Shape = [];
    if (isVertical) for (let i = 0; i < size; i++) points.push([0, i]);
    else for (let i = 0; i < size; i++) points.push([i, 0]);
    return shape(points);
  }
  if (args.length === 3) {
    const w = args[0] as number;
    const h = args[1] as number;
    const isVertical = (args[2] as boolean) ?? false;

    const width = isVertical ? Math.min(w, h) : Math.max(w, h);
    const height = isVertical ? Math.max(w, h) : Math.min(w, h);

    const points: Shape = [];

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        points.push([x,y]);
      }
    }

    return shape(points);
  }
  throw new Error('Incorrect arguments count in rectangle()');
}

// Фигура — окрестность точки, кроме самой точки
export function near(): ShapeGenerator {
  // если отформатировать в матрицу 3 на 3, будет понятнее
  return shape([
    [-1, -1],
    [0, -1],
    [+1, -1],
    [-1, 0],
    /*[x,y]*/ [+1, 0],
    [-1, +1],
    [0, +1],
    [+1, +1],
  ]);
}

// Набор типов и действий с точками
export const pointSeperator = 'x'; // сепаратор чтобы делить и собирать
type PointLabel = `${XAxis}x${YAxis}`; // литеральный тип как шаблон

// Из точки в строку, перегружаем функцию для удобства работы
export function pointToString(point: Point): PointLabel;
export function pointToString(x: XAxis, y: YAxis): PointLabel;
export function pointToString(first: unknown, second?: unknown): PointLabel {
  let x: number, y: number;
  if (second !== undefined) {
    x = first as number;
    y = second as number;
  } else {
    [x, y] = first as Point;
  }
  return `${x}${pointSeperator}${y}`;
}

// из строки в точку
export function stringToPoint(label: PointLabel): Point {
  return label.split(pointSeperator) as unknown as Point;
}

/**
 * Объединяем множество точек в уникальную фигуру, без повторов
 */
export function combine(points: Shape): Shape {
  const result = new Set(points.map((point) => pointToString(...point)));
  return [...result.values()].map(
    (point) => stringToPoint(point).map((value) => Number(value)) as Point
  );
}

/**
 * Просто герератор случайного числа в диапазоне
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Функция для вывода числительных
 */
export function declOfNum(number: number, titles: string[]): string {  
  number = Math.abs(number);
  let cases = [2, 0, 1, 1, 1, 2];  
  return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
};

/**
 * Форматирует объект даты в строку
 */
export function formatDate(date: Date): string {
  return [date.getFullYear(), date.getMonth(), date.getDate()].join('-')
}