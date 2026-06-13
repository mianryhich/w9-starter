import clsx from "clsx";

import { Table, TableCell } from "../lib/Table";
import { axis2D, index } from "../lib/utils";
import { CalendarDay } from "../lib/Calendar";
import { GridBuilder } from "../lib/Grid";
import { createElement } from "./utils";

/**
 * Тип данных ячейки в генерируемой таблице
 */
export type CalendarCell = {
  value: string;
  date: Date | null;
  className: string;
};

/**
 * Здесь все что мы хотим использовать из календаря
 */
export interface ICalendar {
  currentYear: number;
  currentMonth: number;
  currentMonthName: string;
  calendarDays: CalendarDay[];
  getWeek(day: number): number;
  getWeekDayName(day: number): string;
  prevMonth: ICalendar;
  nextMonth: ICalendar;
}

/**
 * Интерфейс конструктора, если захотим передавать не инстансом
 */
export interface CalendarBuilderConstructor {
  new (calendar: ICalendar, onCellClick?: (cell: HTMLButtonElement) => void): GridBuilder<CalendarCell>
}

/**
 * Билдер для таблицы календаря 7×5 + заголовки с перекрытием соседних месяцев
 */
export class CalendarBuilder extends GridBuilder<CalendarCell> {
  // размеры на 1 больше для вывода заголовков строк и колонок
  static readonly WIDTH = 8;
  static readonly HEIGHT = 6;

  /**
   * @param calendar инстанс календаря
   * @param onCellClick коллбек при клике по ячейке (включая заголовочные!)
   */
  constructor(protected calendar: ICalendar, readonly onCellClick?: (cell: HTMLButtonElement) => void) {
    super();
  }
  
  /**
   * Создаем контейнер-форму, для интерактивного календаря
   */
  onContainerInit(): HTMLElement {
    const form = createElement<HTMLFormElement>('form', {
      className: "layer base"
    });
    // чтобы не вешать кучу обработчиков добавим один на всю форму
    // поддержка навигации с клавиатуры сразу в комплекте
    form.addEventListener('submit', this.onSubmit.bind(this));
    return form;
  }

  /**
   * Обработчик сабмита формы, вызывает коллбек с передачей кнопки
   */
  protected onSubmit(event: SubmitEvent) {
    event.preventDefault();
    this.onCellClick?.(event.submitter as HTMLButtonElement);
    return false;
  }

  /**
   * Создает таблицу данных календаря
   */
  onTableInit(): Table<CalendarCell> {
    return new Table<CalendarCell>(
      CalendarBuilder.WIDTH, 
      CalendarBuilder.HEIGHT, 
      this.onCellInit.bind(this));
  }

  /**
   * Рендер отдельной ячейки календаря
   * @param item.cell {CalendarCell} данные ячейки из таблицы
   * @param item.x {number} координата ячейки по горизонтали
   * @param item.y {number} координата ячейки по вертикали
   */
  onCellRender({ cell, x, y }: TableCell<CalendarCell>): HTMLButtonElement {
    const { value, className } = cell;
    return createElement<HTMLButtonElement>('button', {
      className: clsx("cell", className),
      dataset: { x, y }
    }, createElement<HTMLSpanElement>('span', {
      textContent: value
    }));
  }

  /**
   * Формирует данные для отдельной ячейки календаря
   * @param _ предыдущее значение, но в данном случае его нет
   * @param cellIndex {number} индекс ячейки в таблице
   */
  protected onCellInit(_: unknown, cellIndex?: number) {
    // для универсальности функции getValue индекс объявлен как опциональный
    // но так как вызов происходит из fillArray, то он есть всегда
    // конвертируем индекс в координаты
    const [x, y] = axis2D(cellIndex!, CalendarBuilder.WIDTH);
    // дни к нам приходят плоским массивом, 
    // но мы будем с ним работать как с таблицей 7×5, 
    // то есть на 1 меньше всего календаря
    const days = this.calendar.calendarDays;

    // чтобы понять в какой половине таблицы мы работаем
    const middleIndex = Math.floor((CalendarBuilder.WIDTH * CalendarBuilder.HEIGHT) / 2);

    // объявляем и инициализируем дефолтные значения
    let value = String(cellIndex || "");
    let className = "";
    let date: Date | null = null;

    // угловая ячейка, в ней ничего нет
    if (x === 0 && y === 0) value = "";
    // первая строка, заголовки с днями недели
    else if (y === 0 && x !== 0) value = this.calendar.getWeekDayName(x - 1);
    // первая колонка, заголовки с номерами недель
    else if (x === 0 && y !== 0) {
      // нужно получить данные для первого дня недели
      // координаты транслируем из таблицы 8×6 в 7×5
      const [day, isCurrentMonth] = days[index(x,y - 1, 7)];
      if (isCurrentMonth) {
        // с текущим месяцем просто получаем номер недели
        value = String(this.calendar.getWeek(day) + 1);
      } else {
        // перед актуальными датам добавлены дни предыдущего месяца, 
        // а после следующего, так что проверка на середину поможет
        // понять какой нам нужен
        if (cellIndex! < middleIndex) {
          value = String(this.calendar.prevMonth.getWeek(day) + 1);
        } else {
          value = String(this.calendar.nextMonth.getWeek(day) + 1);
        }
      }
    }
    else {
      // это уже непосредственно ячейки с календарными днями, получаем данные
      const [day, isCurrentMonth] = days[index(x - 1,y - 1, 7)];
      value = String(day);
      className = isCurrentMonth 
        ? 'day in-range' // дни в диапазоне выбранного месяца
        : 'day out-of-range'; // дни соседних месяцев

      // пользователь данных нашей таблицы не захочет сам вычислять дату,
      // здесь выполнить это вычисление удобнее
      if (isCurrentMonth) {
        date = new Date(
          this.calendar.currentYear, 
          this.calendar.currentMonth, 
          day
        );
      } else {
        date = (cellIndex! < middleIndex) ? new Date(
          this.calendar.prevMonth.currentYear, 
          this.calendar.prevMonth.currentMonth, 
          day
        ) : new Date(
          this.calendar.nextMonth.currentYear, 
          this.calendar.nextMonth.currentMonth, 
          day
        )
      }
    }

    // если это любая из заголовочных ячеек докинем CSS-класс
    className = clsx(className, {
      "header": x === 0 || y === 0 // если значение true, то класс будет добавлен
    });

    return {
      value,
      date,
      className
    };
  }
}