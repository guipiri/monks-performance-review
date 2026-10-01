import { useQuery } from "@tanstack/react-query";
import {
  getEvaluationsGiven,
  getEvaluationById,
  getSubordinates,
  getCriteriaMetadata,
} from "../services/evaluation";

export function useEvaluationsGiven(evaluatedId?: number) {
  return useQuery({
    queryKey: ["evaluations", "given", evaluatedId],
    queryFn: () => getEvaluationsGiven(evaluatedId),
  });
}

export function useEvaluationDetails(id: number | null) {
  return useQuery({
    queryKey: ["evaluations", "detail", id],
    queryFn: () => (id ? getEvaluationById(id) : null),
    enabled: Boolean(id),
  });
}

export function useSubordinates() {
  return useQuery({
    queryKey: ["subordinates"],
    queryFn: getSubordinates,
  });
}

export function useCriteriaMetadata() {
  return useQuery({
    queryKey: ["evaluationCriteria"],
    queryFn: getCriteriaMetadata,
  });
}
