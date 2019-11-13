import {
  graphStyle,
  STEP_NAME_START,
  STEP_NAME_END,
  STEP_TYPE_TASK,
  STEP_TYPE_CHOICE,
  STEP_TYPE_FOREACH,
  STEP_TYPE_PARALLEL,
  STEP_TYPE_FAKE,
} from './constants';
import {
  Cell,
  CellMap,
  Edge,
  StepDescriptor,
  GraphCell,
  GraphEdge,
} from './description';
import { generateUUID } from '../utils';

const mx = require('mxgraph');
const mxgraph = mx({});
const {
  mxGraph,
  mxConstants,
  mxUtils,
  mxHierarchicalLayout,
} = mxgraph;

const styles = [
  graphStyle.ENDPOINT,
  graphStyle.STEP,
  graphStyle.GTOUP,
  graphStyle.FAKE,
];

export const initStyleSheet = (graph: any) => {
  styles.forEach(s => {
    graph.getStylesheet().putCellStyle(s.id, s.style);
  });
  const style = graph.getStylesheet().getDefaultEdgeStyle();
  style[mxConstants.STYLE_CURVED] = '1';
}

export const initGraph = (container: HTMLDivElement): any => {
  const graph = new mxGraph(container);
  initStyleSheet(graph);
  return graph;
}

const initCellMap = (cellMap: CellMap) => {
  cellMap[STEP_NAME_START] = {
    id: STEP_NAME_START,
    label: STEP_NAME_START,
    depth: 0,
    style: 'endpoint',
    width: 40,
    height: 40,
  }
  cellMap[STEP_NAME_END] = {
    id: STEP_NAME_END,
    label: STEP_NAME_END,
    depth: 0,
    style: 'endpoint',
    width: 40,
    height: 40,
  }
}

const getStyleName = (stepType: string, isFake?: boolean): string => {
  if (isFake) {
    return graphStyle.FAKE.id;
  }
  if ([STEP_TYPE_PARALLEL, STEP_TYPE_FOREACH, STEP_TYPE_CHOICE].includes(stepType)) {
    return graphStyle.GTOUP.id;
  }
  return graphStyle.STEP.id;
}

const generateFakeCell = (step: StepDescriptor, depth: number, isRoot: boolean): Cell => {
  const fakeName = `${step.name}-${generateUUID()}`;
  return {
    id: fakeName,
    type: STEP_TYPE_FAKE,
    label: step.type,
    parent: step.name,
    depth,
    isRoot,
    style: getStyleName(step.type, true),
  }
}

const processTaskStep = (
  parent: any,
  step: StepDescriptor,
  cellMap: CellMap,
  edgeList: Edge[],
  depth: number,
) => {
  if (step.type !== STEP_TYPE_TASK || !step.catch) {
    return;
  }
  for (const taskCatch of step.catch) {
    if (taskCatch.goto) {
      edgeList.push({
        source: step.name,
        target: taskCatch.goto,
      });
    }
  }
}

const processParallelStep = (
  parent: any,
  step: StepDescriptor,
  cellMap: CellMap,
  edgeList: Edge[],
  depth: number,
) => {
  if (step.type !== STEP_TYPE_PARALLEL) {
    return;
  }
  const fakeCell = generateFakeCell(step, depth + 1, true);
  cellMap[fakeCell.id] = fakeCell;
  if (!step.branches) {
    return;
  }
  for (const branch of step.branches) {
    if (branch.steps) {
      analysisInputData(step.name, branch.steps, cellMap, edgeList, depth + 1);
      edgeList.push({
        source: fakeCell.id,
        target: branch.steps[0].name,
      });
    }
  }
}

const processForeachStep = (
  parent: any,
  step: StepDescriptor,
  cellMap: CellMap,
  edgeList: Edge[],
  depth: number,
) => {
  if (step.type !== STEP_TYPE_FOREACH) {
    return;
  }
  const fakeCell = generateFakeCell(step, depth + 1, true);
  cellMap[fakeCell.id] = fakeCell;
  if (!step.steps) {
    return;
  }
  analysisInputData(step.name, step.steps, cellMap, edgeList, depth + 1);
  edgeList.push({
    source: fakeCell.id,
    target: step.steps[0].name,
  });
}

const processChoiceStep = (
  parent: any,
  step: StepDescriptor,
  cellMap: CellMap,
  edgeList: Edge[],
  depth: number,
) => {
  if (step.type !== STEP_TYPE_CHOICE) {
    return;
  }
  const fakeCell = generateFakeCell(step, depth + 1, true);
  cellMap[fakeCell.id] = fakeCell;
  if (step.choices) {
    for (const choice of step.choices) {
      if (choice.steps && choice.steps.length > 0) {
        analysisInputData(step.name, choice.steps, cellMap, edgeList, depth + 1);
        edgeList.push({
          source: fakeCell.id,
          target: choice.steps[0].name,
        });
      }
      if (choice.goto) {
        edgeList.push({
          source: step.name,
          target: choice.goto,
        });
      }
    }
  }
  if (step.default) {
    if (step.default.steps) {
      analysisInputData(step.name, step.default.steps, cellMap, edgeList, depth + 1);
      edgeList.push({
        source: fakeCell.id,
        target: step.default.steps[0].name,
      });
    }
    if (step.default.goto) {
      edgeList.push({
        source: step.name,
        target: step.default.goto,
      });
    }
  }
}

const isEndStep = (step: StepDescriptor): boolean => {
  return step.end || ['succeed', 'fail'].includes(step.type);
}

export const analysisInputData = (
  parent: any,
  steps: StepDescriptor[],
  cellMap: CellMap,
  edgeList: Edge[],
  depth: number,
) => {
  if (depth === 0) {
    initCellMap(cellMap);
  }
  if (steps.length === 0) {
    if (depth === 0) {
      edgeList.push({
        source: STEP_NAME_START,
        target: STEP_NAME_END,
      });
    }
    return;
  }
  for (const step of steps) {
    if (!step.name || !step.type) {
      throw new Error('Step name or type should not be null.');
    }
    if (cellMap[step.name]) {
      throw new Error(`Step name should be unique. ${step.name} has already been defined.`);
    }
    cellMap[step.name] = {
      id: step.name,
      type: step.type,
      label: step.name,
      parent,
      depth,
      style: getStyleName(step.type),
    }
  }
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const nextStepName = i === steps.length - 1 || isEndStep(step)
      ? STEP_NAME_END : steps[i+1].name;
    if (nextStepName !== STEP_NAME_END || depth === 0) {
      edgeList.push({
        source: step.name,
        target: nextStepName,
      });
    }
    if (step.type === STEP_TYPE_TASK) {
      processTaskStep(parent, step, cellMap, edgeList, depth);
    }
    if (step.type === STEP_TYPE_PARALLEL) {
      processParallelStep(parent, step, cellMap, edgeList, depth);
    }
    if (step.type === STEP_TYPE_FOREACH) {
      processForeachStep(parent, step, cellMap, edgeList, depth);
    }
    if (step.type === STEP_TYPE_CHOICE) {
      processChoiceStep(parent, step, cellMap, edgeList, depth);
    }
  }
  if (depth === 0) {
    edgeList.push({
      source: STEP_NAME_START,
      target: steps[0].name,
    });
  }
}

export const insertVertex = (
  graph: any, parent: any, id: string, label: string,
  style?: string, width?: number, height?: number,
): GraphCell => {
  const labelSize = mxUtils.getSizeForString(
    label,
    mxConstants.DEFAULT_FONTSIZE,
    mxConstants.DEFAULT_FONTFAMILY,
  );
  return graph.insertVertex(
    parent || graph.getDefaultParent(),
    id,
    label,
    0,
    0,
    width || labelSize.width + 40,
    height || 40,
    style,
  )
}

export const insertEdge = (
  graph: any, source: GraphCell,
  target: GraphCell, label?: string,
): GraphEdge => {
  return graph.insertEdge(
    graph.getDefaultParent(),
    undefined,
    label,
    source,
    target,
  );
}

const getHierarchicalLayout = (graph: any): any => {
  const layout = new mxHierarchicalLayout(graph);
  layout.horizontal = false;
  layout.intraCellSpacing = 30;
  layout.interRankCellSpacing = 30;
  layout.resizeParent = true;
  layout.parentBorder = 15;
  return layout;
}

export const renderGraph = (
  graph: any,
  cellMap: CellMap,
  edgeList: Edge[],
) => {
  const graphCellMap: { [s: string]: GraphCell } = {};

  let cellList: Cell[] = [];
  for (const stepName in cellMap) {
    cellList.push(cellMap[stepName]);
  }
  cellList = cellList.sort((a, b) => a.depth - b.depth);

  const parentRootList: { parent: string, root: string }[] = [];
  for (const cell of cellList) {
    graphCellMap[cell.id] = insertVertex(
      graph,
      cell.parent ? graphCellMap[cell.parent] : null,
      cell.id,
      cell.label,
      cell.style,
      cell.width,
      cell.height,
    );
    if (cell.isRoot) {
      parentRootList.unshift({
        parent: cell.parent,
        root: cell.id,
      });
    }
  }
  for (const edge of edgeList) {
    insertEdge(graph, graphCellMap[edge.source], graphCellMap[edge.target], edge.label);
  }

  const layout = getHierarchicalLayout(graph);
  for (const pr of parentRootList) {
    layout.execute(graphCellMap[pr.parent], graphCellMap[pr.root]);
  }
  layout.execute(graph.getDefaultParent(), graphCellMap.Start);

  graph.center(true, false);
  graph.setEnabled(false);
}
