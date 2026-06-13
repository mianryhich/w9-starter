import { formatDate, random } from "./utils";

export type TaskList = Record<string, string[]>;
type ToDo = {
  id: string, 
  todo: string
};

/**
 * Генератор фейкового списка дел для тестирования календаря
 */
export async function generateFakeData(): Promise<TaskList> {
  const currentDate = new Date();
  const tasks: TaskList = {
    // таким должен быть формат, 
    // не лучшее решение, но для теста так удобнее 
    //'2024-0-15': ['Дело 1', 'Дело 2', 'Дело 3']
  };

  const response = await fetch('https://dummyjson.com/todos');
  const result: string[] = (await response.json()).todos
    .map((item: ToDo) => item.todo);

  do {
    // случайно распределяем по дням
    const dayTasks = result.splice(0, random(1, 5));
    const randomDate = formatDate(new Date(
      currentDate.getFullYear(), 
      currentDate.getMonth(), 
      random(0, 31)
    ));
    tasks[randomDate] = dayTasks;
  } while(result.length);

  return tasks;
}