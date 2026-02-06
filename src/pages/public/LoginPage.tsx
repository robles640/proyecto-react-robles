import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { useActionState } from 'react';
import { schemaLogin, type LoginFormValues } from '../../models/login.model';
import type { ActionState } from '../../interfaces';
import { createInitialState, handleZodError } from '../../helpers';
import { useAlert, useAuth, useAxios } from '../../hooks';
import { Link, useNavigate } from 'react-router-dom';

//const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type LoginActionState = ActionState<LoginFormValues>;
const initialState = createInitialState<LoginFormValues>();

export const LoginPage = () => {
  const axios = useAxios();
  const { showAlert } = useAlert();
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginApi = async (
    _: LoginActionState | undefined,
    formData: FormData,
  ): Promise<LoginActionState | undefined> => {
    const rawData: LoginFormValues = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };
    try {
      schemaLogin.parse(rawData);
      //await delay(5000);
      const response = await axios.post('/login', rawData);
      if (!response?.data.token) throw new Error('No token recibido');
      login(response.data.token, { username: rawData.username });
      showAlert('Bienvenido', 'success');
      navigate('/perfil');
    } catch (error) {
      const err = handleZodError<LoginFormValues>(error, rawData);
      showAlert(err.message, 'error');
      return err;
    }
  };

  const [state, submitAction, isPending] = useActionState(
    loginApi,
    initialState,
  );
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component={'h1'} variant="h4" gutterBottom>
            LOGIN
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Proyecto Diplomado con React 19
          </Typography>

          {/* Errores */}

          <Box component={'form'} action={submitAction} sx={{ width: '100%' }}>
            <TextField
              name="username"
              required
              fullWidth
              label="usuario"
              type="text"
              autoComplete="username"
              autoFocus
              defaultValue={state?.formData?.username}
              error={!!state?.errors.username}
              helperText={!!state?.errors.username}
              disabled={isPending}
              sx={{ mb: '30px' }}
            />
            <TextField
              name="password"
              required
              fullWidth
              label="Contraseña"
              type="password"
              autoComplete="password"
              autoFocus
              defaultValue={state?.formData?.password}
              error={!!state?.errors.password}
              helperText={!!state?.errors.password}
              disabled={isPending}
              sx={{ mb: '30px' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
            <Link to={'/user'}>Registrar nuevo usuario</Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
