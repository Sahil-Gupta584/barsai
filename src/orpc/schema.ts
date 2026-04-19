import { z } from 'zod'

export const TodoSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
})

export const RapGenerateInputSchema = z.object({
  topic: z.string().min(3).max(200),
  guestToken: z.string().optional(),
})

export const RapGenerateOutputSchema = z.object({
  videoUrl: z.string(),
  jobId: z.string(),
})
