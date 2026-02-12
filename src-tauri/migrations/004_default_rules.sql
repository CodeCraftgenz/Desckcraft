-- DeskCraft default rules
-- Migration 004: Regras padrão para o perfil Pessoal

-- Regra 1: Imagens → pasta Imagens
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-images', 'Organizar Imagens', 'Move arquivos de imagem para a pasta Imagens', 1, 1, 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-images', 'rule-default-images', 'extension', 'matches', 'jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-images', 'rule-default-images', 'move_to_subfolder', 'Imagens', '', '', 0);

-- Regra 2: Documentos → pasta Documentos
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-docs', 'Organizar Documentos', 'Move documentos (PDF, Word, Excel, etc.) para a pasta Documentos', 1, 2, 2, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-docs', 'rule-default-docs', 'extension', 'matches', 'pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|odt|ods|odp|rtf', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-docs', 'rule-default-docs', 'move_to_subfolder', 'Documentos', '', '', 0);

-- Regra 3: Vídeos → pasta Vídeos
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-videos', 'Organizar Vídeos', 'Move arquivos de vídeo para a pasta Vídeos', 1, 3, 3, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-videos', 'rule-default-videos', 'extension', 'matches', 'mp4|avi|mkv|mov|wmv|flv|webm|m4v|mpg|mpeg', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-videos', 'rule-default-videos', 'move_to_subfolder', 'Vídeos', '', '', 0);

-- Regra 4: Áudio → pasta Música
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-audio', 'Organizar Áudio', 'Move arquivos de áudio para a pasta Música', 1, 4, 4, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-audio', 'rule-default-audio', 'extension', 'matches', 'mp3|wav|flac|aac|ogg|wma|m4a|opus', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-audio', 'rule-default-audio', 'move_to_subfolder', 'Música', '', '', 0);

-- Regra 5: Compactados → pasta Compactados
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-archives', 'Organizar Compactados', 'Move arquivos compactados para a pasta Compactados', 1, 5, 5, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-archives', 'rule-default-archives', 'extension', 'matches', 'zip|rar|7z|tar|gz|bz2|xz|iso', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-archives', 'rule-default-archives', 'move_to_subfolder', 'Compactados', '', '', 0);

-- Regra 6: Instaladores → pasta Instaladores
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-installers', 'Organizar Instaladores', 'Move instaladores e executáveis para a pasta Instaladores', 1, 6, 6, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-installers', 'rule-default-installers', 'extension', 'matches', 'exe|msi|dmg|deb|rpm|appimage', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-installers', 'rule-default-installers', 'move_to_subfolder', 'Instaladores', '', '', 0);

-- Associar todas as regras ao perfil Pessoal
INSERT OR IGNORE INTO profile_rules (id, profile_id, rule_id, sort_order)
VALUES
    ('pr-default-images', 'default-profile-001', 'rule-default-images', 1),
    ('pr-default-docs', 'default-profile-001', 'rule-default-docs', 2),
    ('pr-default-videos', 'default-profile-001', 'rule-default-videos', 3),
    ('pr-default-audio', 'default-profile-001', 'rule-default-audio', 4),
    ('pr-default-archives', 'default-profile-001', 'rule-default-archives', 5),
    ('pr-default-installers', 'default-profile-001', 'rule-default-installers', 6);
