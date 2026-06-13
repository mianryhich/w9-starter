import { createElement } from "./utils";
import { declOfNum, formatDate } from "../lib/utils";
import { TaskList } from "../lib/API";

/**
 * Интерфейс для внешнего использования
 */
export interface ITask {
  createTaskList(date: Date): HTMLElement;
}

/**
 * Вывод задач через ненумерованный список
 */
export class TaskListUI implements ITask {
  protected _items: TaskList = {};

  /**
   * Получить объект с задачами
   */
  get items() {
    return this._items;
  }

  /**
   * Установить задачи (дополняет, но не перетирает данные)
   */
  set items(value) {
    Object.assign(this.items, value);
  }

  /**
   * Создает список задач для конкретной даты если для нее нашлись данные
   */
  createTaskList(date: Date): HTMLElement {
    const [firstTask, ...restTasks] = this.items[formatDate(date)] || [];

    return createElement<HTMLUListElement>('ul', {}, [
      firstTask ? this.createTaskItem(firstTask) : null,
      restTasks.length 
        ? restTasks.length > 1 
          ? this.createMoreTasks(restTasks.length) 
          : this.createTaskItem(restTasks[0])
        : null
    ].filter(t => !!t) as HTMLElement[]);
  }

  /**
   * Создает элемент задачи
   */
  protected createTaskItem(task: string): HTMLElement {
    return createElement<HTMLLIElement>('li', {
      textContent: task
    });
  }

  /**
   * Создает элемент "Еще N задач"
   */
  protected createMoreTasks(amount: number) {
    const label = declOfNum(amount, ['задача', 'задачи', 'задач']);
    return this.createTaskItem(`Еще ${amount} ${label}`);
  }
}