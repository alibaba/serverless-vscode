
export interface StepDescriptor {
  type: string,
  name: string,
  end?: boolean,
  catch?: { errors: string[], goto: string, steps?: StepDescriptor[] }[],
  [s: string]: any,
}

export interface CellMap {
  [s: string]: Cell;
}

export interface Cell {
  id: string,
  type?: string,
  label: string,
  parent?: any,
  depth: number;
  isRoot?: boolean;
  style?: string;
  width?: number;
  height?: number;
}

export interface Edge {
  source: string,
  target: string,
  label?: string,
}

export type GraphCell = any;
export type GraphEdge = any;
