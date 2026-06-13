import "./index.scss";

import { createElement, ensureElement } from "./ui/utils";
import { MonthCalendar } from "./lib/Calendar";
import { Table, TableCell } from "./lib/Table";
import { CalendarUI } from "./ui/CalendarUI";
import { CalendarBuilder, CalendarCell, ICalendar } from "./ui/CalendarBuilder";
import { declOfNum, formatDate } from "./lib/utils";
import { Grid, GridBuilder } from "./lib/Grid";
import { generateFakeData, TaskList } from "./lib/API";
import { TaskListUI, ITask } from "./ui/TaskListUI";

//@todo: задание 1, расширить билдер и вывести задачи
// используя TaskListUI.createTaskList(date: Date)

// вот эти объекты лучше не менять, до задания 3
const root = ensureElement<HTMLElement>('main .calendar');
const calendar = new MonthCalendar();
const tasks = new TaskListUI();

// этот объект можно и нужно менять
const builder = new CalendarBuilder(calendar, (cell) => {
  const x = Number(cell.dataset.x);
  const y = Number(cell.dataset.y);
  console.log(`Click on ${x}x${y}`);
  // @todo: задание 2, выделить ячейку по клику
  // здесь могут быть разные решения
});

// и этот объект тоже можно и нужно менять
const ui = new CalendarUI(root, calendar, builder, {
  onPrevMonth: () => {
    calendar.prev();
    ui.update();
  },
  onNextMonth: () => {
    calendar.next();
    ui.update();
  }
});

// источник случайных дел на этот месяц
generateFakeData()
.then(result => {
  tasks.items = result;
  console.log(result);
  ui.update();
});