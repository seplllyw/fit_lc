// 认证
export interface User {
  id: number;
  email: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 训练记录
export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  id: number;
  exerciseName: string;
  duration?: number;
  distance?: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: number;
  date: string;
  exercises: WorkoutExercise[];
}

// 围度记录
export type BodyPart = 'chest' | 'waist' | 'hips' | 'biceps' | 'thighs' | 'calves' | 'other';

export interface MeasurementItem {
  bodyPart: BodyPart;
  value: number;
}

export interface Measurement {
  id: number;
  date: string;
  items: MeasurementItem[];
}

// 消息
// 工具类型
export type ToolType = 'workout' | 'measurement' | 'plan' | 'adjustment' | 'query' | 'analysis';

// 查询型工具 meta
export interface QueryMeta {
  type: 'query';
  queryType: 'workout' | 'measurement';
  summary: {
    totalWorkouts?: number;
    totalVolume?: number;
    totalDuration?: number;
    changes?: Record<string, number>;
  };
}

// 分析型工具 meta
export interface AnalysisMeta {
  type: 'analysis';
  completionRate: number;
  completed: number;
  skipped: number;
  pending: number;
  suggestions: string[];
}

// 修改 SavedData
export interface SavedData {
  type: ToolType;
  id?: number;  // 仅保存型工具有 id
  meta?: QueryMeta | AnalysisMeta;
}

// 计划
export interface PlanExercise {
  id?: number;
  plan_id?: number;
  day_of_week: number;
  exercise_name: string;
  sets: number;
  reps: string;
  weight?: number;
  duration?: number;
  rest_seconds?: number;
  order_index: number;
}

export interface Plan {
  id: number;
  user_id: number;
  name: string;
  goal: 'bulk' | 'cut' | 'maintain';
  frequency: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: string;
  conditions?: string;
  body_weight?: number;
  body_fat?: number;
  height?: number;
  duration_weeks: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  exercises?: PlanExercise[];
  created_at: string;
}

export interface UserProfile {
  name?: string;
  goal: 'bulk' | 'cut' | 'maintain';
  frequency: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: string;
  conditions?: string;
  body_weight?: number;
  bodyFat?: number;
  height?: number;
  duration_weeks: number;
}

export interface ExecutionInput {
  plan_exercise_id: number;
  scheduled_date: string;
  completed_reps?: number;
  completed_weight?: number;
  status: 'completed' | 'skipped';
  notes?: string;
}

export interface ExecutionStats {
  total: number;
  completed: number;
  skipped: number;
  pending: number;
  completionRate: number;
  suggestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  savedData?: SavedData;
  isFromCoach?: boolean;
  coachMessageType?: 'reminder' | 'achievement' | 'encouragement' | 'checkin';
}

// 肌肉
export interface Muscle {
  id: number;
  name: string;
  group: string;
  parent_muscle_id?: number;
}

export type MuscleRole = 'agonist' | 'synergist' | 'antagonist' | 'stabilizer';

export interface SuggestedMuscle {
  name: string;
  role: MuscleRole;
}

export interface ExerciseMuscle {
  muscleId: number;
  role: MuscleRole;
  muscle?: Muscle;
}

// Admin types
export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
export type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell' | 'bands' | 'other';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'compound' | 'isolation';
export type VariantType = 'equipment' | 'difficulty' | 'posture';
export type ExerciseStatus = 'draft' | 'published';

export interface Exercise {
  id?: number;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  difficulty: Difficulty;
  description?: string;
  steps?: string;
  safetyNotes?: string;
  commonMistakes?: string;
  adjustmentNotes?: string;
  exerciseType?: ExerciseType;
  variantType?: VariantType;
  status: ExerciseStatus;
  muscles?: ExerciseMuscle[];
}

export interface MuscleInput {
  muscleId: number;
  role: MuscleRole;
}
