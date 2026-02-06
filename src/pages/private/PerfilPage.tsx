import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';
import { useAuth } from '../../hooks';

export const PerfilPage = () => {
  const { user } = useAuth();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Card
        sx={{
          width: 350,
          textAlign: 'center',
          boxShadow: 4,
          borderRadius: 3,
          p: 2,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            bgcolor: 'primary.main',
            fontSize: 32,
          }}
        >
          {user?.username?.charAt(0) || 'U'}
        </Avatar>

        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {user?.username || 'Usuario'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bienvenido a tu perfil 👋
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
