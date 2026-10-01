import { httpClient } from "../http/client";
import type {
  CreateEvaluationPayload,
  EvaluationItem,
  SubordinateItem,
} from "../types/evaluation";

export interface GetEvaluationsParams {
  evaluatedId?: number;
  evaluatorId?: number;
}

export async function getEvaluations(
  params?: GetEvaluationsParams,
): Promise<EvaluationItem[]> {
  const response = await httpClient.get<EvaluationItem[]>("/evaluations", {
    params: {
      evaluated_id: params?.evaluatedId,
      evaluator_id: params?.evaluatorId,
    },
  });
  return response.data;
}

export const getEvaluationsGiven = getEvaluations;

export async function getEvaluationById(id: number): Promise<EvaluationItem> {
  const response = await httpClient.get<EvaluationItem>(`/evaluations/${id}`);
  return response.data;
}

export async function getSubordinates(): Promise<SubordinateItem[]> {
  const response = await httpClient.get<SubordinateItem[]>(
    "/evaluations/subordinates",
  );
  return response.data;
}

export async function createEvaluation(
  payload: CreateEvaluationPayload,
): Promise<EvaluationItem> {
  const response = await httpClient.post<EvaluationItem>(
    "/evaluations",
    payload,
  );
  return response.data;
}

