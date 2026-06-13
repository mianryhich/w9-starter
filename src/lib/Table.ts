import { Shape, Size, XAxis, YAxis } from "./types";
import { CalculatedValue, axis2D, fillArray, getValue, index, inRange, pointToString } from "./utils";

export type TableCell<T> = {
  x: XAxis;
  y: YAxis;
  index: number;
  cell: T;
};

/**
 * Таблица "X Столбцов" × "Y Строк" в одномерном формате хранения
 */
export class Table<T> implements Iterable<TableCell<T>> {
  protected cells: T[] = [];

  constructor(
    readonly width: Size,
    readonly height: Size,
    readonly defaultValue: CalculatedValue<T>
  ) {
    this.reset();
  }

  reset() {
    this.cells = fillArray(this.width * this.height, this.defaultValue);
  }

  get(x: XAxis, y: YAxis): T | null {
    return this.inRange(x, y) ? this.cells[index(x, y, this.width)] : null;
  }

  set(x: XAxis, y: YAxis, value: CalculatedValue<T>): T | null {
    if (this.inRange(x, y)) {
      const i = index(x, y, this.width);
      return (this.cells[i] = getValue(value, this.cells[i], i));
    } else return null;
  }

  place(points: Shape, value: CalculatedValue<T>): void {
    this.forEach(points, ({ x, y }) => this.set(x, y, value));
  }

  map<I>(callback: (cell: TableCell<T>) => I): I[]; 
  map<I>(points: Shape, callback: (cell: TableCell<T | null>) => I): I[]; 
  map<I>(first: unknown, second: unknown = undefined): I[] {
    const callback = second 
      ? second as (cell: TableCell<T | null>) => I
      : first as (cell: TableCell<T>) => I;
    const points = (second ? first : this.filter(() => true)) as Shape;

    if (second && typeof second === "function") {
      const callback = second as (cell: TableCell<T | null>) => I
      const points = first as Shape;

      return points.map(([x, y], index) =>
        callback({
          x,
          y,
          index,
          cell: this.get(x, y),
        })
      );
    } else {
      const callback = first as (cell: TableCell<T>) => I;
      const points = this.filter(() => true) as Shape;

      return points.map(([x, y], index) =>
        callback({
          x,
          y,
          index,
          cell: this.get(x, y) as T,
        })
      );
    }
  }

  forEach(callback: (value: TableCell<T>) => void): void;
  forEach(points: Shape, callback: (value: TableCell<T | null>) => void): void;
  forEach(first: unknown, second: unknown = undefined): void {
    if (second && typeof second === "function") {
      const callback = second as (value: TableCell<T | null>) => void;
      const points = first as Shape;

      points.forEach(([x, y], index) =>
        callback({
          x,
          y,
          index,
          cell: this.get(x, y),
        })
      );
    } else {
      const callback = first as (value: TableCell<T>) => void;
      const points = this.filter(() => true) as Shape;

      points.forEach(([x, y], index) =>
        callback({
          x,
          y,
          index,
          cell: this.get(x, y) as T,
        })
      );
    }
  }

  filter(callback: (value: TableCell<T>) => boolean): Shape {
    return this.cells
      .map((cell, index) => {
        const [x, y] = axis2D(index, this.width);
        return { x, y, index, cell } as TableCell<T>;
      })
      .filter((cell) => callback(cell))
      .map((cell) => [cell.x, cell.y] as [XAxis, YAxis]);
  }

  flip(points: Shape): Shape {
    const flatPoints: string[] = points.map(pointToString);
    const result: Shape = [];
    this.forEach(({x, y}) => {
      if (!flatPoints.includes(pointToString(x, y))) {
        result.push([x, y]);
      }
    });
    return result;
  }

  inRange(x: XAxis, y: YAxis) {
    return inRange(x, 0, this.width - 1) && inRange(y, 0, this.height - 1);
  }

  [Symbol.iterator](): Iterator<TableCell<T>> {
    return new TableCellIterator<T>(this.cells, this.width);
  }
}

class TableCellIterator<T> implements Iterator<TableCell<T>> {
  private index = 0;

  constructor(private cells: T[], private width: number) {}

  next(): IteratorResult<TableCell<T>> {
    if (this.index < this.cells.length) {
      const [x, y] = axis2D(this.index, this.width);
      const index = this.index++;
      return {
        done: false,
        value: {
          cell: this.cells[index],
          index,
          x,
          y,
        },
      };
    } else {
      return {
        done: true,
        value: null,
      };
    }
  }
}
