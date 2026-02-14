-- DeskCraft extra default rules
-- Migration 005: 4 novas regras padrão para o perfil Pessoal

-- Regra 7: Fontes → pasta Fontes
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-fonts', 'Organizar Fontes', 'Move arquivos de fonte para a pasta Fontes', 1, 7, 7, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-fonts', 'rule-default-fonts', 'extension', 'matches', 'ttf|otf|woff|woff2|eot|fon', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-fonts', 'rule-default-fonts', 'move_to_subfolder', 'Fontes', '', '', 0);

-- Regra 8: Código-fonte → pasta Código
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-code', 'Organizar Código-fonte', 'Move arquivos de programação para a pasta Código', 1, 8, 8, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-code', 'rule-default-code', 'extension', 'matches', 'py|js|ts|jsx|tsx|html|css|scss|json|xml|yaml|yml|java|cpp|c|h|rb|go|rs|php|sh|bat|sql|md', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-code', 'rule-default-code', 'move_to_subfolder', 'Código', '', '', 0);

-- Regra 9: Design → pasta Design
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-design', 'Organizar Arquivos de Design', 'Move arquivos de design e edição para a pasta Design', 1, 9, 9, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-design', 'rule-default-design', 'extension', 'matches', 'psd|ai|eps|indd|xd|fig|sketch|blend|stl|obj|fbx|raw|cr2|nef|arw|dng', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-design', 'rule-default-design', 'move_to_subfolder', 'Design', '', '', 0);

-- Regra 10: E-books → pasta E-books
INSERT OR IGNORE INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
VALUES ('rule-default-ebooks', 'Organizar E-books', 'Move livros digitais para a pasta E-books', 1, 10, 10, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order)
VALUES ('cond-default-ebooks', 'rule-default-ebooks', 'extension', 'matches', 'epub|mobi|azw|azw3|fb2|djvu|cbr|cbz', 'AND', 0);

INSERT OR IGNORE INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order)
VALUES ('act-default-ebooks', 'rule-default-ebooks', 'move_to_subfolder', 'E-books', '', '', 0);

-- Associar as novas regras ao perfil Pessoal
INSERT OR IGNORE INTO profile_rules (id, profile_id, rule_id, sort_order)
VALUES
    ('pr-default-fonts', 'default-profile-001', 'rule-default-fonts', 7),
    ('pr-default-code', 'default-profile-001', 'rule-default-code', 8),
    ('pr-default-design', 'default-profile-001', 'rule-default-design', 9),
    ('pr-default-ebooks', 'default-profile-001', 'rule-default-ebooks', 10);
