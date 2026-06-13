import { Table, TableCell } from "./Table";

/**
 * Генератор таблиц на основе CSS-grid
 * реализован с использованием паттерна Builder
 */
export class Grid {
  protected cells?: Table<any>;
  protected container?: HTMLElement;

  /**
   * В конструктор передаем конкретный билдер
   */
  constructor(builder: GridBuilder<any>) {
    // 1. инициализируем таблицу с данными
    this.cells = builder.onTableInit();
    // 2. инициализируем контейнер
    this.container = builder.onContainerInit();
    this.container.style.setProperty('--w', String(this.cells.width));
    this.container.style.setProperty('--h', String(this.cells.height));

    // 3. добавляем в таблицу ячейки
    for (const cell of this.cells) {
      const cellElement = builder.onCellRender(cell);
      this.container.append(cellElement);
    }
  }

  /**
   * Возвращает DOM-элемент контейнера с готовой сборкой
   */
  assembly(): HTMLElement {
    return this.container!;
  }
}

/**
 * Абстрактный билдер для наследования
 */
export abstract class GridBuilder<T> {
  /**
   * Возвращает таблицу с данными,
   * которые будут выводиться в ячейках.
   * Но сам вывод нужно сделать в onCellRender
   */
  abstract onTableInit(): Table<T>;
  // если нужно выделить инициализацию ячеек, то вот пример ниже
  //protected abstract onCellInit(_: unknown, cellIndex?: number): T;

  /**
   * Возвращает DOM-элемент контейнера, 
   * в который дальше будут добавляться ячейки
   */
  abstract onContainerInit(): HTMLElement;

  /**
   * Возвращает DOM-элемент отдельной ячейки
   */
  abstract onCellRender(cell: TableCell<T>): HTMLElement;
}