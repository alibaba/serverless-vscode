import * as H from 'history';

export interface HistoryProps {
  history: H.History;
}

export interface FlowInfoProps extends HistoryProps {
}

export interface ExecutionListProps extends HistoryProps {
  flowName: string;
}

export interface ExecutionStartProps {
  flowName: string;
  onClose: () => void;
  onSuccess: () => void;
}
