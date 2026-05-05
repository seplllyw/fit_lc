// @ts-nocheck
import { planRepository } from '../repositories/planRepository';
import prisma from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/client';

export const planService = {
  // Create plan with exercises
  async createPlan(userId, userProfile, exercises) {
    const planData = {
      name: userProfile.name,
      goal: userProfile.goal,
      frequency: userProfile.frequency,
      experience: userProfile.experience,
      equipment: userProfile.equipment,
      conditions: userProfile.conditions,
      body_weight: userProfile.body_weight,
      body_fat: userProfile.body_fat,
      height: userProfile.height,
      duration_weeks: userProfile.duration_weeks,
      status: 'draft'
    };

    // Use transaction to ensure atomicity: create plan + add exercises
    const planId = await prisma.$transaction(async (tx) => {
      const planName = planData.name || `健身计划-${Date.now()}`;
      const plan = await tx.workoutPlan.create({
        data: {
          userId,
          name: planName,
          goal: planData.goal,
          frequency: planData.frequency,
          experience: planData.experience,
          equipment: planData.equipment,
          conditions: planData.conditions ?? null,
          bodyWeight: planData.body_weight ? new Decimal(planData.body_weight.toString()) : null,
          bodyFat: planData.body_fat ? new Decimal(planData.body_fat.toString()) : null,
          height: planData.height ? new Decimal(planData.height.toString()) : null,
          durationWeeks: planData.duration_weeks,
          status: 'draft'
        }
      });

      if (exercises && exercises.length > 0) {
        for (const exercise of exercises) {
          await tx.planExercise.create({
            data: {
              planId: plan.id,
              dayOfWeek: exercise.dayOfWeek,
              exerciseId: exercise.exerciseId ?? null,
              exerciseName: exercise.exerciseName,
              targetMuscles: exercise.targetMuscles ?? null,
              sets: exercise.sets ?? 3,
              reps: exercise.reps ?? '8-12',
              weight: exercise.weight ? new (require('@prisma/client/runtime/client').Decimal)(exercise.weight.toString()) : null,
              duration: exercise.duration ?? null,
              restSeconds: exercise.restSeconds ?? 60,
              orderIndex: exercise.orderIndex ?? 0
            }
          });
        }
      }

      return plan.id;
    });

    return planId;
  },

  // Get plan with exercises
  async getPlan(planId, userId) {
    const plan = await planRepository.findById(planId, userId);
    if (!plan) {
      return null;
    }

    // findById already includes exercises with exercise relation
    return plan;
  },

  // Get all user plans
  async getUserPlans(userId) {
    const plans = await planRepository.findByUserId(userId);
    return plans;
  },

  // Update plan
  async updatePlan(planId, userId, updates) {
    const plan = await planRepository.findById(planId, userId);
    if (!plan) {
      throw new Error('计划不存在');
    }

    const success = await planRepository.update(planId, userId, updates);
    return success;
  },

  // Update plan exercise
  async updatePlanExercise(exerciseId, planId, updates) {
    const success = await planRepository.updateExercise(exerciseId, planId, updates);
    return success;
  },

  // Delete plan
  async deletePlan(planId, userId) {
    const plan = await planRepository.findById(planId, userId);
    if (!plan) {
      throw new Error('计划不存在');
    }

    const success = await planRepository.delete(planId, userId);
    return success;
  },

  // Activate plan (set status to 'active')
  async activatePlan(planId, userId) {
    const plan = await planRepository.findById(planId, userId);
    if (!plan) {
      throw new Error('计划不存在');
    }

    const success = await planRepository.update(planId, userId, { status: 'active' });
    return success;
  },

  // Adjust plan (MVP: basic adjustments)
  async adjustPlan(planId, userId, adjustment) {
    const plan = await planRepository.findById(planId, userId);
    if (!plan) {
      throw new Error('计划不存在');
    }

    // MVP implementation: just update the plan with the adjustment
    // Future: AI-powered adjustment logic
    const updates = {};

    if (adjustment.exercises) {
      // For MVP, we just update existing exercises
      // In a full implementation, this would involve AI analysis
      for (const [exerciseId, newValues] of Object.entries(adjustment.exercises)) {
        await planRepository.updateExercise(parseInt(exerciseId), planId, newValues);
      }
    }

    if (adjustment.frequency) {
      updates.frequency = adjustment.frequency;
    }

    if (adjustment.goal) {
      updates.goal = adjustment.goal;
    }

    if (Object.keys(updates).length > 0) {
      await planRepository.update(planId, userId, updates);
    }

    return true;
  },

  // Record execution
  async recordExecution(planId, executionData) {
    const plan = await planRepository.findById(planId, executionData.userId || executionData.user_id);
    if (!plan) {
      throw new Error('计划不存在');
    }

    const execution = {
      planId: planId,
      planExerciseId: executionData.plan_exercise_id || executionData.planExerciseId,
      scheduledDate: executionData.scheduled_date || executionData.scheduledDate || new Date().toISOString().split('T')[0],
      status: executionData.status || 'completed',
      completedReps: executionData.completed_reps || executionData.completedReps,
      completedWeight: executionData.completed_weight || executionData.completedWeight,
      notes: executionData.notes
    };

    const result = await planRepository.recordExecution(execution);
    return result.id;
  },

  // Get plan analysis with stats and suggestions
  async getPlanAnalysis(planId, userId) {
    const plan = await planRepository.findById(planId, userId);
    if (!plan) {
      throw new Error('计划不存在');
    }

    const stats = await planRepository.getExecutionStats(planId);

    // Calculate completion rate
    const completionRate = stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

    // Generate basic suggestions based on completion rate
    let suggestions = [];
    if (completionRate < 50) {
      suggestions.push('Consider reducing workout frequency or intensity');
    } else if (completionRate >= 80) {
      suggestions.push('Great progress! You may be ready for increased intensity');
    }

    return {
      planId,
      stats: {
        total: stats.total,
        completed: stats.completed,
        skipped: stats.skipped,
        pending: stats.pending,
        completionRate
      },
      exercises: plan.exercises.map(e => ({
        id: e.id,
        name: e.exerciseName,
        targetMuscles: e.targetMuscles,
        dayOfWeek: e.dayOfWeek,
        sets: e.sets,
        reps: e.reps,
        exerciseId: e.exerciseId
      })),
      suggestions
    };
  }
};