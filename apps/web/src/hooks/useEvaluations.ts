import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  getSubordinates,
  type GetEvaluationsParams,
} from "../services/evaluation";
import type {
  CreateEvaluationPayload,
  EvaluationItem,
  SubordinateItem,
} from "../types/evaluation";

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

export function useCreateEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEvaluationPayload) => createEvaluation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["subordinates"] });
    },
  });
}

