import { useState, useMemo } from "react";
import axios from "axios";
import { useCreateEvaluation } from "../../hooks/useEvaluations";
import { CRITERIA_DEFINITIONS } from "../../constants/criteria-metadata";
import type { SubordinateItem } from "../../types/evaluation";
import {
  calculatePreviewScore,
  type CriteriaField,
} from "../../utils/evaluation";
import { ScoreBadge } from "./ScoreBadge";
import { CriteriaRatingInput } from "./CriteriaRatingInput";

interface CreateEvaluationModalProps {
  subordinates: SubordinateItem[];
  onClose: () => void;
}

const INITIAL_SCORES: Record<CriteriaField, number> = {
  delivery_of_results: 3,
  execution_and_quality: 3,
  learning_and_development: 3,
  problem_solving: 3,
  collaboration_and_leadership: 3,
  strategic_vision: 3,
};

export function CreateEvaluationModal({
  subordinates,
  onClose,
}: CreateEvaluationModalProps) {
  const createMutation = useCreateEvaluation();
  const [selectedSubordinateId, setSelectedSubordinateId] =
    useState<string>("");
  const [scores, setScores] =
    useState<Record<CriteriaField, number>>(INITIAL_SCORES);
  const [comments, setComments] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedSubordinate = useMemo(() => {
    if (!selectedSubordinateId) return null;
    return (
      subordinates.find((s) => s.id === Number(selectedSubordinateId)) || null
    );
  }, [subordinates, selectedSubordinateId]);

  const previewScore = useMemo(() => calculatePreviewScore(scores), [scores]);

  const handleScoreChange = (field: CriteriaField, value: number) => {
    setScores((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubordinateId) {
      setErrorMessage("Por favor, selecione um subordinado para avaliar.");
      return;
    }

    if (selectedSubordinate?.already_evaluated_this_week) {
      setErrorMessage(
        "Este colaborador já possui avaliação realizada nesta semana.",
      );
      return;
    }

    setErrorMessage(null);

    try {
      await createMutation.mutateAsync({
        evaluated_id: Number(selectedSubordinateId),
        delivery_of_results: scores.delivery_of_results,
        execution_and_quality: scores.execution_and_quality,
        learning_and_development: scores.learning_and_development,
        problem_solving: scores.problem_solving,
        collaboration_and_leadership: scores.collaboration_and_leadership,
        strategic_vision: scores.strategic_vision,
        comments: comments.trim() ? comments.trim() : null,
      });
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          "Ocorreu um erro ao registrar a avaliação. Tente novamente.",
        );
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface rounded-2xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">
              Nova Avaliação
            </span>
            <h3 className="text-xl font-bold text-text-heading mt-1">
              Avaliar Desempenho
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Preencha os critérios de 1 a 4 e forneça o feedback qualitativo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-body p-1.5 rounded-lg hover:bg-bg-elevated transition cursor-pointer"
            title="Fechar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagem de Erro se houver */}
          {errorMessage && (
            <div className="p-3 bg-error-subtle border border-error-border text-error-text rounded-xl text-sm flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <p className="leading-snug">{errorMessage}</p>
            </div>
          )}

          {/* Seleção do Subordinado */}
          <div className="space-y-2">
            <label
              htmlFor="subordinate-select"
              className="block text-sm font-bold text-text-heading uppercase tracking-wide"
            >
              Colaborador Avaliado <span className="text-error">*</span>
            </label>
            <select
              id="subordinate-select"
              value={selectedSubordinateId}
              onChange={(e) => {
                setSelectedSubordinateId(e.target.value);
                setErrorMessage(null);
              }}
              required
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-bg-surface text-text-body focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition cursor-pointer shadow-xs"
            >
              <option value="">Selecione um colaborador...</option>
              {subordinates.map((sub) => (
                <option
                  key={sub.id}
                  value={sub.id}
                  disabled={sub.already_evaluated_this_week}
                >
                  {sub.name} ({sub.position_name}) •{" "}
                  {sub.is_direct ? "Direto" : "Indireto"}
                  {sub.already_evaluated_this_week
                    ? " — [Já avaliado esta semana]"
                    : ""}
                </option>
              ))}
            </select>

            {selectedSubordinate &&
              selectedSubordinate.already_evaluated_this_week && (
                <p className="text-xs text-warning-text bg-warning-subtle p-2.5 rounded-lg border border-warning-border mt-2">
                  ℹ️ Este colaborador já possui avaliação registrada nesta
                  semana. A política permite uma avaliação semanal por par
                  líder-liderado.
                </p>
              )}
          </div>

          {/* Score Banner (Prévia em Tempo Real) */}
          <div className="bg-bg-sunken border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted font-medium">
                Nota Ponderada Prevista
              </p>
              <p className="text-2xl font-black text-text-heading">
                {previewScore.toFixed(2)}{" "}
                <span className="text-sm font-normal text-text-muted">
                  / 4.00
                </span>
              </p>
            </div>
            <div className="text-right">
              <ScoreBadge score={previewScore} />
            </div>
          </div>

          {/* Critérios de Avaliação */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-text-heading uppercase tracking-wide">
              Critérios de Desempenho
            </h4>
            <div className="space-y-3">
              {CRITERIA_DEFINITIONS.map((crit) => (
                <CriteriaRatingInput
                  key={crit.key}
                  title={crit.title}
                  weight={crit.weight}
                  score={scores[crit.field as CriteriaField]}
                  onChange={(val) =>
                    handleScoreChange(crit.field as CriteriaField, val)
                  }
                />
              ))}
            </div>
          </div>

          {/* Comentários e Feedback */}
          <div className="space-y-2">
            <label
              htmlFor="comments"
              className="block text-sm font-bold text-text-heading uppercase tracking-wide"
            >
              Observações e Feedback Qualitativo (Opcional)
            </label>
            <textarea
              id="comments"
              rows={3}
              maxLength={2000}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Adicione observações sobre o desempenho, entregas de destaque e pontos de melhoria..."
              className="w-full p-3 border border-border bg-bg-surface text-text-body placeholder:text-text-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition leading-relaxed resize-y"
            />
            <div className="flex justify-end text-xs text-text-muted">
              {comments.length} / 2000 caracteres
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-body bg-bg-surface border border-border hover:bg-bg-elevated rounded-lg transition shadow-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !selectedSubordinateId ||
                selectedSubordinate?.already_evaluated_this_week
              }
              className="px-5 py-2 bg-brand hover:bg-brand-dark disabled:bg-neutral-300 disabled:cursor-not-allowed text-brand-foreground text-sm font-medium rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              {createMutation.isPending ? "Salvando..." : "Salvar Avaliação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
