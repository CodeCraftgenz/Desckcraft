use chrono::{NaiveDateTime, Utc};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

/// The trial duration in days.
const TRIAL_DURATION_DAYS: i64 = 14;

/// The secret salt used for offline license key validation.
/// In a real product, this would be more sophisticated (e.g., RSA signatures).
const LICENSE_SALT: &str = "DeskCraft-2025-License-Salt";

/// Validates a license key using a simple hash-based offline check.
///
/// A valid key has the format `DKCRFT-XXXXX-XXXXX-XXXXX-CHECK` where CHECK
/// is derived from the first parts plus the salt.
pub fn validate_key(key: &str) -> bool {
    let key = key.trim();

    // Must start with "DKCRFT-" prefix
    if !key.starts_with("DKCRFT-") {
        return false;
    }

    let parts: Vec<&str> = key.split('-').collect();
    if parts.len() != 5 {
        return false;
    }

    // The check portion is the last part
    let check = parts[4];

    // Compute expected check from the first 4 parts + salt
    let payload = format!("{}-{}-{}-{}-{}", parts[0], parts[1], parts[2], parts[3], LICENSE_SALT);
    let expected_check = compute_hash_check(&payload);

    check == expected_check
}

/// Checks if the trial period is still active.
///
/// `trial_started` should be a datetime string in "%Y-%m-%d %H:%M:%S" format.
/// Returns `true` if the trial started less than 14 days ago.
pub fn is_trial_active(trial_started: &str) -> bool {
    if trial_started.is_empty() {
        return false;
    }

    match NaiveDateTime::parse_from_str(trial_started, "%Y-%m-%d %H:%M:%S") {
        Ok(start) => {
            let now = Utc::now().naive_utc();
            let elapsed = now.signed_duration_since(start);
            elapsed.num_days() < TRIAL_DURATION_DAYS
        }
        Err(_) => {
            log::warn!("Invalid trial_started format: '{}'", trial_started);
            false
        }
    }
}

/// Returns the number of days remaining in the trial, or 0 if expired.
pub fn trial_days_remaining(trial_started: &str) -> i64 {
    if trial_started.is_empty() {
        return 0;
    }

    match NaiveDateTime::parse_from_str(trial_started, "%Y-%m-%d %H:%M:%S") {
        Ok(start) => {
            let now = Utc::now().naive_utc();
            let elapsed = now.signed_duration_since(start);
            let remaining = TRIAL_DURATION_DAYS - elapsed.num_days();
            remaining.max(0)
        }
        Err(_) => 0,
    }
}

/// Generates a license key for testing/development purposes.
/// This would NOT be in production code.
#[cfg(debug_assertions)]
pub fn generate_test_key(part1: &str, part2: &str, part3: &str) -> String {
    let payload = format!("DKCRFT-{}-{}-{}-{}", part1, part2, part3, LICENSE_SALT);
    let check = compute_hash_check(&payload);
    format!("DKCRFT-{}-{}-{}-{}", part1, part2, part3, check)
}

/// Computes a 5-character uppercase alphanumeric hash check for license validation.
fn compute_hash_check(payload: &str) -> String {
    let mut hasher = DefaultHasher::new();
    payload.hash(&mut hasher);
    let hash = hasher.finish();

    // Convert to a 5-char uppercase alphanumeric string
    let chars: Vec<char> = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".chars().collect();
    let base = chars.len() as u64;

    let mut result = String::with_capacity(5);
    let mut remaining = hash;
    for _ in 0..5 {
        let idx = (remaining % base) as usize;
        result.push(chars[idx]);
        remaining /= base;
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invalid_key_format() {
        assert!(!validate_key("invalid"));
        assert!(!validate_key("DKCRFT-123"));
        assert!(!validate_key(""));
    }

    #[test]
    fn test_valid_generated_key() {
        let key = generate_test_key("AAAAA", "BBBBB", "CCCCC");
        assert!(validate_key(&key));
    }

    #[test]
    fn test_trial_active() {
        let now = Utc::now().naive_utc();
        let started = now.format("%Y-%m-%d %H:%M:%S").to_string();
        assert!(is_trial_active(&started));
    }

    #[test]
    fn test_trial_expired() {
        let past = Utc::now().naive_utc() - chrono::Duration::days(15);
        let started = past.format("%Y-%m-%d %H:%M:%S").to_string();
        assert!(!is_trial_active(&started));
    }

    #[test]
    fn test_trial_empty() {
        assert!(!is_trial_active(""));
    }
}
