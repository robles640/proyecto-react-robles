import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { z } from 'zod';
import { useAxios, useAlert } from '../../hooks';

/* =======================
   VALIDACIÓN
======================= */
const taskSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().min(5, "Mínimo 5 caracteres"),
});

/* =======================
   TIPADO
======================= */
interface Task {
  id: number;
  name: string;
  description: string;
  is_completed: boolean;
}

export const TaskPage = () => {
  const axios = useAxios();
  const { showAlert } = useAlert();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  /* =======================
      API - OBTENER
  ======================= */
  const getTasks = async () => {
    try {
      const res = await axios.get('/tasks');
      // Aseguramos que data sea un array analizando la respuesta del backend
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTasks(data);
    } catch (err) {
      showAlert('Error al cargar tareas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  /* =======================
      CREATE / UPDATE
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    taskSchema.parse({ title, description });
    const payload = { name: title, description };

    if (editingId) {
      await axios.put(`/tasks/${editingId}`, payload);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, name: title, description }
            : t
        )
      );

      showAlert('Tarea actualizada', 'success');
    } else {
      const res = await axios.post('/tasks', payload);

      setTasks((prev) => [
        ...prev,
        { ...res.data, is_completed: false },
      ]);

      showAlert('Tarea creada', 'success');
    }

    resetForm();
  } catch (err) {
    showAlert('Error al guardar', 'error');
  }
};


  /* =======================
      DELETE
  ======================= */
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await axios.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showAlert('Tarea eliminada', 'info');
    } catch {
      showAlert('No se pudo eliminar', 'error');
    }
  };

  /* =======================
      CAMBIO DE ESTADO (CORREGIDO)
  ======================= */
  /* =======================
      CAMBIO DE ESTADO (SOLUCIÓN DEFINITIVA)
  ======================= */
  const changeStatus = async (task: Task, value: string) => {
    const isCompleted = value === 'finalizada';

    try {
      // Intentamos con PATCH primero, pero enviando el objeto más completo
      // Si sigue fallando, el servidor requiere los campos obligatorios
      await axios.patch(`/tasks/${task.id}`, {
        name: task.name,           // Re-enviamos el nombre
        description: task.description, // Re-enviamos la descripción
        is_completed: isCompleted,
      });

      // Actualizamos el estado local
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, is_completed: isCompleted } : t
        )
      );
      showAlert(`Tarea marcada como ${value}`, 'success');
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      // Si falla el PATCH, intentamos un último recurso con PUT
      try {
        await axios.put(`/tasks/${task.id}`, {
          name: task.name,
          description: task.description,
          is_completed: isCompleted,
        });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, is_completed: isCompleted } : t
          )
        );
        showAlert(`Tarea actualizada a ${value}`, 'success');
      } catch (putErr) {
        showAlert('El servidor no permite cambiar el estado. Revisa la consola.', 'error');
      }
    }
  };

  /* =======================
      HELPERS
  ======================= */
  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.name);
    setDescription(task.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Mis Tareas
      </Typography>

      {/* FORMULARIO */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField 
            label="Título" 
            variant="outlined"
            fullWidth
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          <TextField 
            label="Descripción" 
            variant="outlined"
            fullWidth
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            multiline 
            rows={2}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              startIcon={editingId ? <SaveIcon /> : <EditIcon />}
              sx={{ height: 45 }}
            >
              {editingId ? 'Guardar Cambios' : 'Crear Tarea'}
            </Button>
            {editingId && (
              <Button variant="outlined" color="inherit" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* LISTADO */}
      <List>
        {tasks.map((task) => (
          <Paper 
            key={task.id} 
            sx={{ 
              mb: 1.5, 
              borderLeft: '6px solid', 
              borderColor: task.is_completed ? 'success.main' : 'warning.main',
              borderRadius: 2,
              transition: '0.3s'
            }}
          >
            <ListItem sx={{ py: 2 }}>
              <ListItemText
                primary={
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      color: task.is_completed ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    {task.name}
                  </Typography>
                }
                secondary={task.description}
              />

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  size="small"
                  value={task.is_completed ? 'finalizada' : 'pendiente'}
                  onChange={(e) => changeStatus(task, e.target.value)}
                  sx={{ 
                    mr: 2, 
                    minWidth: 120,
                    bgcolor: task.is_completed ? 'success.light' : 'warning.light',
                    '& .MuiSelect-select': { py: 0.5 }
                  }}
                >
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="finalizada">Finalizada</MenuItem>
                </Select>

                <IconButton onClick={() => startEdit(task)} size="small" sx={{ mr: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>

                <IconButton color="error" onClick={() => handleDelete(task.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>
      {tasks.length === 0 && (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          No hay tareas registradas.
        </Typography>
      )}
    </Box>
  );
};