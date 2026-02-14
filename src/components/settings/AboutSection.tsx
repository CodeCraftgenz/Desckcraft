import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  Download,
  ExternalLink,
  Keyboard,
  Cpu,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const APP_VERSION = '1.0.0';

const TECH_STACK = [
  { name: 'Tauri', description: 'Framework nativo multiplataforma', color: 'text-sky-500' },
  { name: 'React', description: 'Interface do usuário reativa', color: 'text-cyan-500' },
  { name: 'Rust', description: 'Backend seguro e performático', color: 'text-orange-500' },
  { name: 'TypeScript', description: 'Tipagem estática no frontend', color: 'text-blue-500' },
  { name: 'Tailwind CSS', description: 'Estilização utilitária', color: 'text-teal-500' },
];

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const KEYBOARD_SHORTCUTS: ShortcutEntry[] = [
  { keys: ['Ctrl', 'N'], description: 'Nova regra' },
  { keys: ['Ctrl', 'S'], description: 'Salvar regra atual' },
  { keys: ['Ctrl', 'E'], description: 'Executar simulação' },
  { keys: ['Ctrl', ','], description: 'Abrir configurações' },
  { keys: ['Ctrl', 'Z'], description: 'Desfazer última ação' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Refazer ação' },
  { keys: ['Esc'], description: 'Cancelar / Fechar modal' },
  { keys: ['Ctrl', 'H'], description: 'Abrir histórico' },
  { keys: ['Ctrl', '?'], description: 'Abrir ajuda' },
];

/**
 * AboutSection — Application information, credits, and shortcuts.
 *
 * Provides:
 * - App name, version, and description
 * - Tech stack credits
 * - Exportar Diagnóstico button
 * - Keyboard shortcuts cheat sheet
 * - Link to Help Center
 */
export function AboutSection() {
  const handleExportDiagnostic = useCallback(() => {
    // In the future, this will collect logs + sanitized config and export
    // For now, just log to console
    console.log('[DeskCraft] Exporting diagnostic data...');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card padding="lg">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="
              flex items-center justify-center
              w-9 h-9 rounded-lg
              bg-gray-100 dark:bg-gray-800
              ring-1 ring-gray-200/50 dark:ring-gray-700
            "
          >
            <Info size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Sobre
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Informações do aplicativo, créditos e atalhos
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* App info card */}
          <div
            className="
              relative overflow-hidden rounded-xl p-5
              bg-gradient-to-br from-gray-50 to-gray-100
              dark:from-gray-800/80 dark:to-gray-800/40
              border border-gray-200 dark:border-gray-700
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  DeskCraft
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Organização inteligente de arquivos para sua área de trabalho
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 leading-relaxed max-w-md">
                  DeskCraft automatiza a organização dos seus arquivos usando regras
                  personalizáveis, perfis e monitoramento inteligente. Tudo processado
                  localmente, com total privacidade.
                </p>
              </div>
              <Badge variant="info">v{APP_VERSION}</Badge>
            </div>

            {/* Decorative icon */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.04] dark:opacity-[0.06]">
              <Cpu size={120} strokeWidth={1} />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Tech stack */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={14} className="text-gray-400 dark:text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tecnologias
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TECH_STACK.map((tech) => (
                <div
                  key={tech.name}
                  className="
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    bg-gray-50 dark:bg-gray-800/50
                    border border-gray-100 dark:border-gray-800
                  "
                >
                  <div className={`text-xs font-bold ${tech.color} w-20`}>
                    {tech.name}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tech.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Keyboard shortcuts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={14} className="text-gray-400 dark:text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Atalhos de teclado
              </h4>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                <div
                  key={shortcut.description}
                  className={`
                    flex items-center justify-between px-4 py-2.5
                    ${index < KEYBOARD_SHORTCUTS.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                  `}
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex}>
                        <kbd
                          className="
                            inline-flex items-center justify-center
                            min-w-[24px] h-6 px-1.5 rounded
                            bg-gray-100 dark:bg-gray-700
                            border border-gray-200 dark:border-gray-600
                            text-[11px] font-mono font-medium
                            text-gray-700 dark:text-gray-300
                            shadow-[0_1px_0_0] shadow-gray-300 dark:shadow-gray-600
                          "
                        >
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mx-0.5">
                            +
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportDiagnostic}
            >
              Exportar Diagnóstico
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={ExternalLink}
              onClick={() => {
                // In the future, this will open the help center URL
                console.log('[DeskCraft] Opening help center...');
              }}
            >
              Central de Ajuda
            </Button>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center pt-2">
            DeskCraft v{APP_VERSION} — Feito com dedicação para simplificar sua vida digital.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
