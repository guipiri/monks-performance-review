import { useQuery } from "@tanstack/react-query";
import {
  getEvaluations,
  getEvaluationById,
  getSubordinates,
  type GetEvaluationsParams,
} from "../services/evaluation";
import type { EvaluationItem, SubordinateItem } from "../types/evaluation";

export function useEvaluations(params?: GetEvaluationsParams) {
  return useQuery<EvaluationItem[]>({
    queryKey: ["evaluations", params?.evaluatedId, params?.evaluatorId],
    queryFn: () => getEvaluations(params),
  });
}

export const useEvaluationsGiven = useEvaluations;

export function useEvaluationDetails(id: number | null) {
  return useQuery<EvaluationItem | null>({
    queryKey: ["evaluations", "detail", id],
    queryFn: () => (id ? getEvaluationById(id) : null),
    enabled: Boolean(id),
  });
}

export function useSubordinates() {
  return useQuery<SubordinateItem[]>({
    queryKey: ["subordinates"],
    queryFn: getSubordinates,
  });
}
