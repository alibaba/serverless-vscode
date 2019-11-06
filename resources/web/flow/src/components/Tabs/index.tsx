import Tabs from '@material-ui/core/Tabs';
import { withStyles } from '@material-ui/core/styles';

const NewTabs = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
  },
  indicator: {
    backgroundColor: '#1890ff',
  }
})(Tabs);

export default NewTabs;
