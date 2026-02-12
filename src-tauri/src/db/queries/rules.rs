use anyhow::{Context, Result};
use rusqlite::Connection;
use uuid::Uuid;

use crate::db::models::{Rule, RuleAction, RuleCondition};

/// Lists all rules ordered by sort_order then priority.
pub fn list_rules(conn: &Connection) -> Result<Vec<Rule>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, name, description, is_enabled, priority, sort_order, created_at, updated_at
             FROM rules ORDER BY sort_order ASC, priority DESC",
        )
        .context("Failed to prepare list_rules query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Rule {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                is_enabled: row.get(3)?,
                priority: row.get(4)?,
                sort_order: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .context("Failed to execute list_rules query")?;

    let mut rules = Vec::new();
    for row in rows {
        rules.push(row.context("Failed to read rule row")?);
    }
    Ok(rules)
}

/// Gets a single rule by ID.
pub fn get_rule(conn: &Connection, id: &str) -> Result<Option<Rule>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, name, description, is_enabled, priority, sort_order, created_at, updated_at
             FROM rules WHERE id = ?1",
        )
        .context("Failed to prepare get_rule query")?;

    let result = stmt
        .query_row([id], |row| {
            Ok(Rule {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                is_enabled: row.get(3)?,
                priority: row.get(4)?,
                sort_order: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .optional()
        .context("Failed to execute get_rule query")?;

    Ok(result)
}

/// Creates a new rule and returns it.
pub fn create_rule(conn: &Connection, name: &str, description: &str) -> Result<Rule> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // Get the next sort_order
    let max_order: i32 = conn
        .query_row("SELECT COALESCE(MAX(sort_order), -1) FROM rules", [], |row| {
            row.get(0)
        })
        .unwrap_or(-1);

    conn.execute(
        "INSERT INTO rules (id, name, description, is_enabled, priority, sort_order, created_at, updated_at)
         VALUES (?1, ?2, ?3, 1, 0, ?4, ?5, ?5)",
        rusqlite::params![id, name, description, max_order + 1, now],
    )
    .context("Failed to insert new rule")?;

    get_rule(conn, &id)?
        .ok_or_else(|| anyhow::anyhow!("Rule was inserted but could not be retrieved"))
}

/// Updates an existing rule.
pub fn update_rule(
    conn: &Connection,
    id: &str,
    name: &str,
    description: &str,
    is_enabled: bool,
    priority: i32,
) -> Result<Rule> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE rules SET name = ?1, description = ?2, is_enabled = ?3, priority = ?4, updated_at = ?5
         WHERE id = ?6",
        rusqlite::params![name, description, is_enabled, priority, now, id],
    )
    .context("Failed to update rule")?;

    get_rule(conn, id)?
        .ok_or_else(|| anyhow::anyhow!("Rule not found after update: {}", id))
}

/// Deletes a rule by ID. Cascading deletes will remove conditions and actions.
pub fn delete_rule(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM rules WHERE id = ?1", [id])
        .context("Failed to delete rule")?;
    Ok(())
}

// ── Rule Conditions ───────────────────────────────────────────────────────

/// Gets all conditions for a given rule, ordered by sort_order.
pub fn get_conditions(conn: &Connection, rule_id: &str) -> Result<Vec<RuleCondition>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, rule_id, field, operator, value, logic_gate, sort_order, created_at
             FROM rule_conditions WHERE rule_id = ?1 ORDER BY sort_order ASC",
        )
        .context("Failed to prepare get_conditions query")?;

    let rows = stmt
        .query_map([rule_id], |row| {
            Ok(RuleCondition {
                id: row.get(0)?,
                rule_id: row.get(1)?,
                field: row.get(2)?,
                operator: row.get(3)?,
                value: row.get(4)?,
                logic_gate: row.get(5)?,
                sort_order: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .context("Failed to execute get_conditions query")?;

    let mut conditions = Vec::new();
    for row in rows {
        conditions.push(row.context("Failed to read condition row")?);
    }
    Ok(conditions)
}

/// Adds a new condition to a rule.
pub fn add_condition(
    conn: &Connection,
    rule_id: &str,
    field: &str,
    operator: &str,
    value: &str,
    logic_gate: &str,
) -> Result<RuleCondition> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) FROM rule_conditions WHERE rule_id = ?1",
            [rule_id],
            |row| row.get(0),
        )
        .unwrap_or(-1);

    conn.execute(
        "INSERT INTO rule_conditions (id, rule_id, field, operator, value, logic_gate, sort_order, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![id, rule_id, field, operator, value, logic_gate, max_order + 1, now],
    )
    .context("Failed to insert rule condition")?;

    Ok(RuleCondition {
        id,
        rule_id: rule_id.to_string(),
        field: field.to_string(),
        operator: operator.to_string(),
        value: value.to_string(),
        logic_gate: logic_gate.to_string(),
        sort_order: max_order + 1,
        created_at: now,
    })
}

/// Deletes a rule condition by ID.
pub fn delete_condition(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM rule_conditions WHERE id = ?1", [id])
        .context("Failed to delete rule condition")?;
    Ok(())
}

// ── Rule Actions ──────────────────────────────────────────────────────────

/// Gets all actions for a given rule, ordered by sort_order.
pub fn get_actions(conn: &Connection, rule_id: &str) -> Result<Vec<RuleAction>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order, created_at
             FROM rule_actions WHERE rule_id = ?1 ORDER BY sort_order ASC",
        )
        .context("Failed to prepare get_actions query")?;

    let rows = stmt
        .query_map([rule_id], |row| {
            Ok(RuleAction {
                id: row.get(0)?,
                rule_id: row.get(1)?,
                action_type: row.get(2)?,
                destination: row.get(3)?,
                rename_pattern: row.get(4)?,
                tag_name: row.get(5)?,
                sort_order: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .context("Failed to execute get_actions query")?;

    let mut actions = Vec::new();
    for row in rows {
        actions.push(row.context("Failed to read action row")?);
    }
    Ok(actions)
}

/// Adds a new action to a rule.
pub fn add_action(
    conn: &Connection,
    rule_id: &str,
    action_type: &str,
    destination: &str,
    rename_pattern: &str,
    tag_name: &str,
) -> Result<RuleAction> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) FROM rule_actions WHERE rule_id = ?1",
            [rule_id],
            |row| row.get(0),
        )
        .unwrap_or(-1);

    conn.execute(
        "INSERT INTO rule_actions (id, rule_id, action_type, destination, rename_pattern, tag_name, sort_order, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![id, rule_id, action_type, destination, rename_pattern, tag_name, max_order + 1, now],
    )
    .context("Failed to insert rule action")?;

    Ok(RuleAction {
        id,
        rule_id: rule_id.to_string(),
        action_type: action_type.to_string(),
        destination: destination.to_string(),
        rename_pattern: rename_pattern.to_string(),
        tag_name: tag_name.to_string(),
        sort_order: max_order + 1,
        created_at: now,
    })
}

/// Deletes a rule action by ID.
pub fn delete_action(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM rule_actions WHERE id = ?1", [id])
        .context("Failed to delete rule action")?;
    Ok(())
}

/// Helper trait to allow optional results from query_row.
trait OptionalExt<T> {
    fn optional(self) -> Result<Option<T>, rusqlite::Error>;
}

impl<T> OptionalExt<T> for std::result::Result<T, rusqlite::Error> {
    fn optional(self) -> Result<Option<T>, rusqlite::Error> {
        match self {
            Ok(val) => Ok(Some(val)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
