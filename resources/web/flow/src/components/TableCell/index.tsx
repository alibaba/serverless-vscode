import TableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/core/styles';

const NewTableCell = withStyles({
  head: {
    color: 'inherit',
  },
  body: {
    color: 'inherit',
  },
  footer: {
    color: 'inherit',
  }
})(TableCell);

export default NewTableCell;
