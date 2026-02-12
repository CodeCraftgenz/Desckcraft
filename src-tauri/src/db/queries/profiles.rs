use anyhow::{Context, Result};
use rusqlite::Connection;
use uuid::Uuid;

use crate::db::models::{Profile, Rule};

/// Lists all profiles ordered by creation date.
pub fn list_profiles(conn: &Connection) -> Result<Vec<Profile>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, name, icon, color, is_active, is_default, created_at, updated_at
             FROM profiles ORDER BY created_at ASC",
        )
        .context("Failed to prepare list_profiles query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Profile {
                id: row.get(0)?,
                name: row.get(1)?,
                icon: row.get(2)?,
                color: row.get(3)?,
                is_active: row.get(4)?,
                is_default: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .context("Failed to execute list_profiles query")?;

    let mut profiles = Vec::new();
    for row in rows {
        profiles.push(row.context("Failed to read profile row")?);
    }
    Ok(profiles)
}

/// Gets the currently active profile.
pub fn get_active_profile(conn: &Connection) -> Result<Option<Profile>> {
    let result = conn
        .query_row(
            "SELECT id, name, icon, color, is_active, is_default, created_at, updated_at
             FROM profiles WHERE is_active = 1 LIMIT 1",
            [],
            |row| {
                Ok(Profile {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    icon: row.get(2)?,
                    color: row.get(3)?,
                    is_active: row.get(4)?,
                    is_default: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        );

    match result {
        Ok(profile) => Ok(Some(profile)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!(e).context("Failed to get active profile")),
    }
}

/// Creates a new profile.
pub fn create_profile(
    conn: &Connection,
    name: &str,
    icon: &str,
    color: &str,
) -> Result<Profile> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO profiles (id, name, icon, color, is_active, is_default, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 0, 0, ?5, ?5)",
        rusqlite::params![id, name, icon, color, now],
    )
    .context("Failed to insert new profile")?;

    Ok(Profile {
        id,
        name: name.to_string(),
        icon: icon.to_string(),
        color: color.to_string(),
        is_active: false,
        is_default: false,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Activates a profile by deactivating all others and activating the specified one.
pub fn activate_profile(conn: &Connection, id: &str) -> Result<()> {
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE profiles SET is_active = 0, updated_at = ?1",
        [&now],
    )
    .context("Failed to deactivate all profiles")?;

    conn.execute(
        "UPDATE profiles SET is_active = 1, updated_at = ?1 WHERE id = ?2",
        rusqlite::params![now, id],
    )
    .context("Failed to activate profile")?;

    Ok(())
}

/// Deletes a profile by ID. Will not delete the default profile.
pub fn delete_profile(conn: &Connection, id: &str) -> Result<()> {
    // Prevent deletion of default profile
    let is_default: bool = conn
        .query_row(
            "SELECT is_default FROM profiles WHERE id = ?1",
            [id],
            |row| row.get(0),
        )
        .unwrap_or(false);

    if is_default {
        return Err(anyhow::anyhow!("Cannot delete the default profile"));
    }

    conn.execute("DELETE FROM profiles WHERE id = ?1", [id])
        .context("Failed to delete profile")?;

    Ok(())
}

/// Gets all rules associated with a profile, ordered by the profile_rules sort_order.
pub fn get_profile_rules(conn: &Connection, profile_id: &str) -> Result<Vec<Rule>> {
    let mut stmt = conn
        .prepare(
            "SELECT r.id, r.name, r.description, r.is_enabled, r.priority, r.sort_order, r.created_at, r.updated_at
             FROM rules r
             INNER JOIN profile_rules pr ON pr.rule_id = r.id
             WHERE pr.profile_id = ?1
             ORDER BY pr.sort_order ASC",
        )
        .context("Failed to prepare get_profile_rules query")?;

    let rows = stmt
        .query_map([profile_id], |row| {
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
        .context("Failed to execute get_profile_rules query")?;

    let mut rules = Vec::new();
    for row in rows {
        rules.push(row.context("Failed to read rule row")?);
    }
    Ok(rules)
}

/// Adds a rule to a profile.
pub fn add_rule_to_profile(conn: &Connection, profile_id: &str, rule_id: &str) -> Result<()> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) FROM profile_rules WHERE profile_id = ?1",
            [profile_id],
            |row| row.get(0),
        )
        .unwrap_or(-1);

    conn.execute(
        "INSERT OR IGNORE INTO profile_rules (id, profile_id, rule_id, sort_order, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, profile_id, rule_id, max_order + 1, now],
    )
    .context("Failed to add rule to profile")?;

    Ok(())
}

/// Removes a rule from a profile.
pub fn remove_rule_from_profile(
    conn: &Connection,
    profile_id: &str,
    rule_id: &str,
) -> Result<()> {
    conn.execute(
        "DELETE FROM profile_rules WHERE profile_id = ?1 AND rule_id = ?2",
        rusqlite::params![profile_id, rule_id],
    )
    .context("Failed to remove rule from profile")?;

    Ok(())
}
