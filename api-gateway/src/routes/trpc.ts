import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { aiService } from '../services/aiService.js';
import { bastionService } from '../services/bastionService.js';

const t = initTRPC.create();

export const appRouter = t.router({
  chat: t.procedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string()
      })),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
      useRag: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      return await aiService.chat(input);
    }),

  bastion: t.router({
    exec: t.procedure
      .input(z.object({
        command: z.string()
      }))
      .mutation(async ({ input }) => {
        return await bastionService.executeCommand(input.command);
      }),

    status: t.procedure
      .query(async () => {
        const result = await bastionService.executeCommand('uptime && free -h');
        return { status: 'online', output: result.output };
      })
  }),

  health: t.procedure
    .query(() => {
      return { status: 'healthy', timestamp: new Date().toISOString() };
    })
});

export type AppRouter = typeof appRouter;
