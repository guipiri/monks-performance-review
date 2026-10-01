export interface UserSummary {
  id: number;
  name: string;
  email: string;
  position_name: string;
}

export interface EvaluationItem {
  id: number;
  evaluator_id: number;
  evaluated_id: number;
  delivery_of_results: number;
  execution_and_quality: number;
  learning_and_development: number;
  problem_solving: number;
  collaboration_and_leadership: number;
  strategic_vision: number;
  final_score: number;
  comments: string | null;
  created_at: string;
  evaluator?: UserSummary | null;
  evaluated?: UserSummary | null;
}

export interface SubordinateItem {
  id: number;
  name: string;
  email: string;
  position_name: string;
  is_direct: boolean;
  already_evaluated_this_week: boolean;
  last_evaluation_date?: string | null;
}

export interface CreateEvaluationPayload {
  evaluated_id: number;
  delivery_of_results: number;
  execution_and_quality: number;
  learning_and_development: number;
  problem_solving: number;
  collaboration_and_leadership: number;
  strategic_vision: number;
  comments?: string | null;
}

