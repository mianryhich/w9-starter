import { fillArray, index } from "./utils";

/**
 * Календарный день с указанием принадлежности текущему месяцу
 */
export type CalendarDay =  [number, boolean];

/**
 * Класс со всеми необходимыми вычислениями для формирования
 * календаря для любого выбранного месяца и года.
 */
export class MonthCalendar {
  static WEEK_DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  static MONTH_LABELS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  // Актуальная дата
  readonly currentDate: Date = new Date();

  // выбранный год и месяц
  currentYear!: number;
  currentMonth!: number;

  constructor(year?: number, month?: number) {
    this.select(
      year ?? this.currentDate.getFullYear(),
      month ?? this.currentDate.getMonth()
    );
  }

  /**
   * Произвольный выбор года и месяца
   */
  select(year: number, month: number) {
    this.currentYear = year;
    this.currentMonth = month;
  }

  /**
   * Переключить внутреннее состояние на следующий месяц
   */
  next() {
    this.select(
      this.nextMonth.currentYear,
      this.nextMonth.currentMonth
    );
  }

  /**
   * Переключить внутреннее состояние на предыдущий месяц
   */
  prev() {
    this.select(
      this.prevMonth.currentYear,
      this.prevMonth.currentMonth
    );
  }

  /**
   * Новый инстанс календаря установленный на предыдущий месяц
   */
  get prevMonth() {
    return new MonthCalendar(
      this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear,
      this.currentMonth === 0 ? 11 : this.currentMonth - 1
    );
  }

  /**
   * Новый инстанс календаря установленный на следующий месяц
   */
  get nextMonth() {
    return new MonthCalendar(
      this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear,
      this.currentMonth === 11 ? 0 : this.currentMonth + 1
    );
  }

  /**
   * Получить объект даты для конкретного дня
   * выбранного в календаре года и месяц
   */
  getDay(day: number) {
    return new Date(this.currentYear, this.currentMonth, day);
  }

  /**
   * Получить название дня недели
   * @example getWeekDayName(0) => Пн
   */
  getWeekDayName(day: number) {
    return MonthCalendar.WEEK_DAY_LABELS[day];
  }

  /**
   * Получить название для месяца
   * @example getMonthName(0) => Январь
   */
  getMonthName(month: number) {
    return MonthCalendar.MONTH_LABELS[month];
  }

  /**
   * Возвращает название выбранного в календаре месяца
   */
  get currentMonthName() {
    return this.getMonthName(this.currentMonth);
  }

  /**
   * Возвращает номер недели в году
   */
  getWeek(day: number) {
    const currentDate = this.getDay(day).getTime();
    const startDate = (new Date(this.currentYear, 0, 1)).getTime();
    let days = Math.floor((currentDate - startDate) /
        (24 * 60 * 60 * 1000));
    
    return Math.ceil(days / 7);
  }

  /**
   * Последний день месяца
   */
  get lastDay() {
    return (new Date(this.currentYear, this.currentMonth+1, 0)).getDate();
  }

  /**
   * Возвращает на какой день недели приходится первое число месяца
   */
  get firstDayOfWeek() {
    return this.getDay(1).getDay();
  }

  /**
   * Возвращает массив дней месяца
   */
  get days() {
    return fillArray<number>(this.lastDay, (_, index) => index!+1);
  }

  /**
   * Возвращает массив дней для календаря
   * с добавлением в начале и конце списка
   * дней соседних месяцев
   * @example [[31, false], [1, true], ..., [30, true], [1, false]]
   */
  get calendarDays(): CalendarDay[] {
    let curDays = this.days;
    let prevDays = this.prevMonth.days;
    let nextDays = this.nextMonth.days;

    return [
      ...((this.firstDayOfWeek > 1 ? prevDays.slice(-(this.firstDayOfWeek - 1)) : []).map(d => [d, false]) as CalendarDay[]),
      ...(curDays.map(d => [d, true]) as CalendarDay[]),
      ...(nextDays.slice(0, 35 - this.lastDay).map(d => [d, false]) as CalendarDay[])
    ];
  }
}