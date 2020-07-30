import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from 'components/Shared/Fields/Text';
import Toast from 'components/Shared/Toast';
import { logError } from 'helpers/rxjs-operators/logError';
import { useFormikObservable } from 'hooks/useFormikObservable';
import IRequest from 'interfaces/models/request';
import React, { forwardRef, Fragment, memo, useCallback } from 'react';
import { tap } from 'rxjs/operators';
import requestService from 'services/request';
import * as yup from 'yup';

interface IProps {
  opened: boolean;
  request?: IRequest;
  onComplete: (request: IRequest) => void;
  onCancel: () => void;
}

const validationSchema = yup.object().shape({
  description: yup.string().required(),
  amount: yup.number().required(),
  value: yup.number().required()
});

const useStyle = makeStyles({
  content: {
    width: 600,
    maxWidth: 'calc(95vw - 50px)'
  },
  heading: {
    marginTop: 20,
    marginBottom: 10
  }
});

const FormDialog = memo((props: IProps) => {
  const classes = useStyle(props);

  const checkModel = useCallback((model: IRequest) => {
    if (typeof model.amount !== 'number') {
      let amountTratado = parseInt(model.amount);
      if (isNaN(amountTratado)) Toast.show('Quantidade inválida');
      model.amount = amountTratado;
    }

    if (typeof model.value !== 'number') {
      let valueTratado = parseFloat(model.value);
      if (isNaN(valueTratado)) Toast.show('Valor inválido');
      model.value = valueTratado;
    }

    return model;
  }, []);

  const formik = useFormikObservable<IRequest>({
    initialValues: {},
    validationSchema,
    onSubmit(model) {
      model = checkModel(model);
      return requestService.save(model).pipe(
        tap(request => {
          Toast.show('O pedido foi salvo com sucesso');
          props.onComplete(request);
        }),
        logError(true)
      );
    }
  });

  const handleEnter = useCallback(() => {
    formik.setValues(props.request ?? formik.initialValues, false);
  }, [formik, props.request]);

  const handleExit = useCallback(() => {
    formik.resetForm();
  }, [formik]);

  return (
    <Dialog
      open={props.opened}
      disableBackdropClick
      disableEscapeKeyDown
      TransitionComponent={Transition}
      onEnter={handleEnter}
      onExited={handleExit}
    >
      {formik.isSubmitting && <LinearProgress color='primary' />}

      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{formik.values.id ? 'Editar' : 'Novo'}</DialogTitle>
        <DialogContent className={classes.content}>
          <Fragment>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField label='Descrição' name='description' formik={formik} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label='Quantidade' type='number' name='amount' formik={formik} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label='Valor' name='value' formik={formik} mask='money' />
              </Grid>
            </Grid>
          </Fragment>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel}>Cancelar</Button>
          <Button color='primary' variant='contained' type='submit' disabled={formik.isSubmitting}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

const Transition = memo(
  forwardRef((props: any, ref: any) => {
    return <Slide direction='up' {...props} ref={ref} />;
  })
);

export default FormDialog;
