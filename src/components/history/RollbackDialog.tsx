import { useState, useCallback } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useHistoryStore } from '@/stores';
import { useToast } from '@/components/ui/Toast';
import type { Run } from '@/types/runs';

/* ---------- Types ---------- */

interface RollbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  run: Run;
}

/* ---------- Component ---------- */

export function RollbackDialog({ isOpen, onClose, run }: RollbackDialogProps) {
  const toast = useToast();
  const rollbackRun = useHistoryStore((s) => s.rollbackRun);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRollback = useCallback(async () => {
    setIsRollingBack(true);
    setResult(null);
    setErrorMessage('');

    try {
      await rollbackRun(run.id);
      setResult('success');
      toast.success('Rollback realizado com sucesso!');
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setResult(null);
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setResult('error');
      setErrorMessage(message);
      toast.error(`Erro no rollback: ${message}`);
    } finally {
      setIsRollingBack(false);
    }
  }, [run.id, rollbackRun, toast, onClose]);

  const handleClose = useCallback(() => {
    if (!isRollingBack) {
      setResult(null);
      setErrorMessage('');
      onClose();
    }
  }, [isRollingBack, onClose]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Confirmar Rollback" size="md">
      <div className="space-y-5">
        {/* Result Feedback */}
        {result === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 mb-3">
              <RotateCcw size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Rollback realizado com sucesso!
            </p>
          </motion.div>
        ) : result === 'error' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                  Erro ao realizar rollback
                </p>
                <p className="text-xs text-red-600 dark:text-red-400/80">
                  {errorMessage}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertTriangle
                size={20}
                className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Tem certeza que deseja desfazer esta execução?
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed">
                  {run.moved_files} arquivo{run.moved_files !== 1 ? 's' : ''}{' '}
                  {run.moved_files !== 1 ? 'serão movidos' : 'será movido'}{' '}
                  de volta para {run.moved_files !== 1 ? 'suas posições originais' : 'sua posição original'}.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success">
                {run.moved_files} movido{run.moved_files !== 1 ? 's' : ''}
              </Badge>
              {run.skipped_files > 0 && (
                <Badge variant="default">
                  {run.skipped_files} ignorado{run.skipped_files !== 1 ? 's' : ''}
                </Badge>
              )}
              {run.error_files > 0 && (
                <Badge variant="danger">
                  {run.error_files} erro{run.error_files !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <strong>Nota:</strong> Arquivos modificados ou deletados externamente
              podem não ser revertidos corretamente.
            </p>
          </>
        )}

        {/* Buttons */}
        {result !== 'success' && (
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isRollingBack}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              icon={RotateCcw}
              loading={isRollingBack}
              onClick={handleRollback}
              disabled={result === 'error'}
            >
              Confirmar Rollback
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
