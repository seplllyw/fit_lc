import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { planService } from '../services/planService';

const router = Router();

// Validation schemas
const userProfileSchema = z.object({
  name: z.string().min(1, '计划名称不能为空').optional(),
  goal: z.enum(['bulk', 'cut', 'maintain']),
  frequency: z.number().min(1).max(7, '频率应为1-7次/周'),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.string().min(1, '请填写可用器械'),
  conditions: z.string().optional(),
  body_weight: z.number().positive().optional().nullable(),
  body_fat: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  duration_weeks: z.number().min(1).max(52)
});

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().min(0),
  reps: z.string(),
  weight: z.number().optional(),
  duration: z.number().optional()
});

// Get user's all plans
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const plans = await planService.getUserPlans(userId);
    res.json({ plans });
  } catch (err) {
    console.error('Get plans error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get plan detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    const userId = req.user!.id;

    const plan = await planService.getPlan(id, userId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ plan });
  } catch (err) {
    console.error('Get plan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI generate plan
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { userProfile, exercises } = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: 'User profile is required' });
    }

    // Validate userProfile
    const validationResult = userProfileSchema.safeParse(userProfile);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid user profile',
        details: validationResult.error.errors
      });
    }

    // Validate exercises if provided
    if (exercises && Array.isArray(exercises)) {
      for (const exercise of exercises) {
        const exerciseValidation = exerciseSchema.safeParse(exercise);
        if (!exerciseValidation.success) {
          return res.status(400).json({
            error: 'Invalid exercise data',
            details: exerciseValidation.error.errors
          });
        }
      }
    }

    // In a full implementation, this would call an AI service to generate the plan
    // For now, we accept a pre-generated plan structure
    const planId = await planService.createPlan(userId, validationResult.data, exercises || []);

    res.json({ planId, message: 'Plan generated successfully' });
  } catch (err) {
    console.error('Generate plan error:', err);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

// Update plan
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    // Handle exercise updates
    if (updates.exercises && Array.isArray(updates.exercises)) {
      for (const exercise of updates.exercises) {
        if (exercise.id) {
          await planService.updatePlanExercise(exercise.id, Number(id), exercise);
        }
      }
      delete updates.exercises;
    }

    if (Object.keys(updates).length > 0) {
      await planService.updatePlan(Number(id), userId, updates);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update plan error:', err);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Delete plan
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await planService.deletePlan(Number(id), userId);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Delete plan error:', err);
    if (err.message === 'Plan not found') {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// Activate plan
router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await planService.activatePlan(Number(id), userId);
    res.json({ success: true, message: 'Plan activated' });
  } catch (err: any) {
    console.error('Activate plan error:', err);
    if (err.message === 'Plan not found') {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.status(500).json({ error: 'Failed to activate plan' });
  }
});

// Adjust plan
router.post('/:id/adjust', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const adjustment = req.body;

    await planService.adjustPlan(Number(id), userId, adjustment);
    res.json({ success: true, message: 'Plan adjusted' });
  } catch (err: any) {
    console.error('Adjust plan error:', err);
    if (err.message === 'Plan not found') {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.status(500).json({ error: 'Failed to adjust plan' });
  }
});

// Record execution
router.post('/:id/executions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const executionData = {
      ...req.body,
      userId
    };

    const executionId = await planService.recordExecution(Number(id), executionData);
    res.json({ success: true, executionId });
  } catch (err: any) {
    console.error('Record execution error:', err);
    if (err.message === 'Plan not found') {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.status(500).json({ error: 'Failed to record execution' });
  }
});

// Get analysis
router.get('/:id/executions/analysis', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const analysis = await planService.getPlanAnalysis(Number(id), userId);
    res.json({ analysis });
  } catch (err: any) {
    console.error('Get analysis error:', err);
    if (err.message === 'Plan not found') {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

export default router;