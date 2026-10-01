import { httpClient } from "../http/client";
import type {
  EvaluationItem,
  SubordinateItem,
  CriterionMetadata,
} from "../types/evaluation";

export async function getEvaluationsGiven(
  evaluatedId?: number,
): Promise<EvaluationItem[]> {
  const response = await httpClient.get<EvaluationItem[]>("/evaluations", {
    params: evaluatedId ? { evaluated_id: evaluatedId } : undefined,
  });
  return response.data;
}

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

export async function getCriteriaMetadata(): Promise<CriterionMetadata[]> {
  const response = await httpClient.get<CriterionMetadata[]>(
    "/evaluations/criteria",
  );
  return response.data;
}
