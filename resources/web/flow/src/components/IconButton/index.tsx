import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import './index.css'

const NewIconButton = withStyles({
  root: {
    color: 'inherit',
  }
})(IconButton);

export default NewIconButton;
