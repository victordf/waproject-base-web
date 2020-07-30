import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Alert from 'components/Shared/Alert';
import TableCellActions from 'components/Shared/Pagination/TableCellActions';
import Toast from 'components/Shared/Toast';
import { logError } from 'helpers/rxjs-operators/logError';
import IRequest from 'interfaces/models/request';
import DeleteIcon from 'mdi-react/DeleteIcon';
import EditIcon from 'mdi-react/EditIcon';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useCallbackObservable } from 'react-use-observable';
import { from } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import requestService from 'services/request';

import useMask from '../../../../../hooks/useMask';

// import { IOption } from 'components/Shared/DropdownMenu';
interface IProps {
  request: IRequest;
  onEdit: (request: IRequest) => void;
  onDeleteComplete: () => void;
}

const ListItem = memo((props: IProps) => {
  const { request, onEdit, onDeleteComplete } = props;
  const { maskApply } = useMask('money', 0);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit(request);
  }, [onEdit, request]);

  const [handleDelete] = useCallbackObservable(() => {
    return from(Alert.confirm('Deseja excluir o pedido?')).pipe(
      filter(ok => ok),
      tap(() => setLoading(true)),
      switchMap(() => requestService.delete(request.id)),
      logError(),
      tap(
        () => {
          Toast.show('O pedido foi removido');
          setLoading(true);
          setDeleted(true);
          onDeleteComplete();
        },
        error => {
          setLoading(false);
          setError(error);
        }
      )
    );
  }, []);

  const handleDismissError = useCallback(() => setError(false), []);

  const options = useMemo(() => {
    return [
      { text: 'Editar', icon: EditIcon, handler: handleEdit },
      { text: 'Excluir', icon: DeleteIcon, handler: handleDelete }
    ];
  }, [handleEdit, handleDelete]);

  if (deleted) return null;

  let maskedValue = maskApply(request.value);
  return (
    <TableRow>
      <TableCell>{request.description}</TableCell>
      <TableCell>{request.amount}</TableCell>
      <TableCell>{maskedValue}</TableCell>
      <TableCellActions options={options} loading={loading} error={error} onDismissError={handleDismissError} />
    </TableRow>
  );
});

export default ListItem;
