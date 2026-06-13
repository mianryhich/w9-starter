import { ensureElement } from "./utils";
import { Grid, GridBuilder } from "../lib/Grid";
import { ICalendar, CalendarCell } from "./CalendarBuilder";

/**
 * Коллбеки для интерфейса календаря
 */
export interface CalendarUIActions {
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

/**
 * Интерфейс календаря, реализующий вывод выбранной даты
 * и возможностью навигации на следующий и предыдущий месяца
 */
export class CalendarUI {
  /**
   * Поддерживаем вывод нескольких таблиц
   * наложенных друг на друга.
   */
  protected layers: Map<string, {
    grid: Grid,
    element: HTMLElement
  }> = new Map();

  // DOM-элементы интерфейса
  protected container: HTMLElement; // контейнер для таблиц
  protected dateLabel: HTMLElement; // выбранный месяц и год
  protected prevButton: HTMLButtonElement; // предыдущий месяц
  protected nextButton: HTMLButtonElement; // следующий месяц

  /**
   * @param root DOM-элемент корневого контейнера календаря
   * @param calendar инстанс календаря, для вывода выбранного года и месяца
   * @param baseBuilder билдер для непосредственно календарной сетки с датами
   * @actions коллбеки для пользовательских действий в интерфейсе
   */
  constructor(
    public root: HTMLElement, 
    protected calendar: ICalendar, 
    protected baseBuilder: GridBuilder<CalendarCell>, {
      onPrevMonth,
      onNextMonth
    }: CalendarUIActions) {
    this.container = ensureElement('.layers', root);
    this.prevButton = ensureElement('button[name=prev]', root);
    this.nextButton = ensureElement('button[name=next]', root);
    this.dateLabel = ensureElement('.current-date', root);

    this.prevButton.addEventListener('click', onPrevMonth);
    this.nextButton.addEventListener('click', onNextMonth);

    this.update();
  }

  /**
   * Обновить состояние интерфейса, 
   * необходимо вызывать при изменении зависимостей,
   * например календаря
   */
  update() {
    this.setLayer('base', this.getBaseLayer());
    this.updateLabel();
  }

  protected updateLabel() {
    this.dateLabel.textContent = `${this.calendar.currentMonthName} ${this.calendar.currentYear}`;
  }

  // Пересоздание грида потенциально может быть в нескольких местах кода
  // поэтому различные подобные инициализации лучше заранее выделить в метод
  protected getBaseLayer() {
    return new Grid(this.baseBuilder);
  }

  /**
   * Добавляет или заменяет слой
   */
  setLayer(name: string, layer: Grid): void {
    const element = layer.assembly();
    if (this.layers.has(name)) {
      this.layers.get(name)!.element.replaceWith(element);
    } else {
      this.container.append(element);
    }
    this.layers.set(name, {
      grid: layer,
      element
    });
  }
}