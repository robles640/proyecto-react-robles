import { z } from 'zod';

export const schemaTask = z.object({
  title: z.string().min(3, 'El título requiere al menos 3 caracteres'),
  description: z.string().min(5, 'La descripción requiere al menos 5 caracteres'),
});

export type TaskFormValues = z.infer<typeof schemaTask>;

export interface Task {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  user_id?: number;
}