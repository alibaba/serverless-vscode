const mx = require('mxgraph');
const mxgraph = mx({});
const {
  mxConstants,
} = mxgraph;

export const graphStyle = {
  ENDPOINT: {
    id: 'endpoint',
    style: {
      [mxConstants.STYLE_STROKECOLOR]: '#d6b656',
      [mxConstants.STYLE_FILLCOLOR]: '#fdf7e9',
      [mxConstants.STYLE_FONTCOLOR]: 'black',
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_ELLIPSE,
    },
  },
  STEP: {
    id: 'step',
    style: {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_STROKECOLOR]: '#7dbff9',
      [mxConstants.STYLE_FILLCOLOR]: '#eaf7fd',
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_DASHED]: 0,
      [mxConstants.STYLE_ARCSIZE]: 10,
      [mxConstants.STYLE_AUTOSIZE]: 1,
    },
  },
  GTOUP: {
    id: 'group',
    style: {
      [mxConstants.STYLE_DASHED]: 1,
      [mxConstants.STYLE_STROKECOLOR]: '#9d9d9d',
      [mxConstants.STYLE_FILLCOLOR]: '#fff',
      [mxConstants.STYLE_FONTCOLOR]: 'black',
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 12,
      [mxConstants.STYLE_VERTICAL_LABEL_POSITION]: mxConstants.ALIGN_TOP,
      [mxConstants.STYLE_VERTICAL_ALIGN]: mxConstants.ALIGN_BOTTOM,
    },
  },
  FAKE: {
    id: 'fake',
    style: {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_STROKECOLOR]: '#9d9d9d',
      [mxConstants.STYLE_FILLCOLOR]: '#fff',
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_DASHED]: 1,
      [mxConstants.STYLE_ARCSIZE]: 15,
      [mxConstants.STYLE_AUTOSIZE]: 1,
    }
  }
}

export const STEP_NAME_START = 'Start';
export const STEP_NAME_END = 'End';
export const STEP_TYPE_FAKE = 'fake';
export const STEP_TYPE_TASK = 'task';
export const STEP_TYPE_CHOICE = 'choice';
export const STEP_TYPE_PARALLEL = 'parallel';
export const STEP_TYPE_FOREACH = 'foreach';
