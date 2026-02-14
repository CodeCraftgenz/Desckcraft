use chrono::{Datelike, Local, NaiveDateTime, NaiveTime, Timelike, Weekday};

/// Parses a standard 5-field cron expression and calculates the next run time
/// after `after`. Supports: minute, hour, day-of-month, month, day-of-week.
///
/// Cron fields: `minute hour day_of_month month day_of_week`
///
/// Supported values:
/// - `*` = any
/// - A single number (e.g. `8`, `30`)
/// - `*/N` = every N (only for minute/hour)
///
/// Returns `None` if the expression is invalid.
pub fn next_run_after(cron_expr: &str, after: NaiveDateTime) -> Option<NaiveDateTime> {
    let parts: Vec<&str> = cron_expr.trim().split_whitespace().collect();
    if parts.len() < 5 {
        return None;
    }

    let minute_spec = parts[0];
    let hour_spec = parts[1];
    let _dom_spec = parts[2]; // day of month — not used in our simplified parser
    let _month_spec = parts[3]; // month — not used
    let dow_spec = parts[4]; // day of week

    // Parse minute
    let (minute_val, minute_any, minute_step) = parse_field(minute_spec)?;
    // Parse hour
    let (hour_val, hour_any, hour_step) = parse_field(hour_spec)?;
    // Parse day of week
    let dow_filter: Option<u32> = if dow_spec == "*" || dow_spec == "?" {
        None
    } else {
        dow_spec.parse::<u32>().ok()
    };

    // Hourly: hour=*, minute is fixed (e.g. "0 * * * *")
    if hour_any && !minute_any {
        let m = minute_val;
        let mut candidate = after + chrono::Duration::minutes(1);
        // Round up to next occurrence of minute=m
        for _ in 0..1500 {
            if candidate.minute() == m {
                return Some(candidate.date().and_time(
                    NaiveTime::from_hms_opt(candidate.hour(), m, 0)?,
                ));
            }
            candidate += chrono::Duration::minutes(1);
        }
        return None;
    }

    // Every N minutes (e.g. "*/15 * * * *")
    if minute_step > 0 && hour_any {
        let mut candidate = after + chrono::Duration::minutes(1);
        // Find next minute divisible by step
        let m = candidate.minute();
        let next_m = ((m / minute_step) + 1) * minute_step;
        if next_m >= 60 {
            candidate = (candidate.date().and_time(
                NaiveTime::from_hms_opt(candidate.hour(), 0, 0)?,
            )) + chrono::Duration::hours(1);
        } else {
            candidate = candidate.date().and_time(
                NaiveTime::from_hms_opt(candidate.hour(), next_m, 0)?,
            );
        }
        return Some(candidate);
    }

    // Every N hours (e.g. "0 */2 * * *")
    if hour_step > 0 {
        let m = if minute_any { 0 } else { minute_val };
        let mut candidate = after + chrono::Duration::minutes(1);
        for _ in 0..750 {
            if candidate.hour() % hour_step == 0 && candidate.minute() == m {
                return Some(candidate.date().and_time(
                    NaiveTime::from_hms_opt(candidate.hour(), m, 0)?,
                ));
            }
            candidate += chrono::Duration::hours(1);
            candidate = candidate.date().and_time(
                NaiveTime::from_hms_opt(candidate.hour(), m, 0)?,
            );
        }
        return None;
    }

    // Daily or weekly: specific hour and minute
    let h = if hour_any { 0 } else { hour_val };
    let m = if minute_any { 0 } else { minute_val };

    let target_time = NaiveTime::from_hms_opt(h, m, 0)?;

    // Start scanning from today
    let mut date = after.date();
    let max_days = 400; // scan up to ~13 months

    // If today's target time is still in the future, start from today
    // Otherwise start from tomorrow
    if date.and_time(target_time) <= after {
        date = date.succ_opt()?;
    }

    for _ in 0..max_days {
        let candidate = date.and_time(target_time);

        // Check day-of-week filter
        if let Some(dow) = dow_filter {
            let candidate_dow = chrono_weekday_to_cron(date.weekday());
            if candidate_dow != dow {
                date = date.succ_opt()?;
                continue;
            }
        }

        return Some(candidate);
    }

    None
}

/// Parses a single cron field. Returns (value, is_wildcard, step).
fn parse_field(field: &str) -> Option<(u32, bool, u32)> {
    if field == "*" {
        return Some((0, true, 0));
    }
    if let Some(step_str) = field.strip_prefix("*/") {
        let step = step_str.parse::<u32>().ok()?;
        return Some((0, true, step));
    }
    let val = field.parse::<u32>().ok()?;
    Some((val, false, 0))
}

/// Converts chrono Weekday to cron day-of-week (0=Sunday, 1=Monday, ..., 6=Saturday).
fn chrono_weekday_to_cron(wd: Weekday) -> u32 {
    match wd {
        Weekday::Sun => 0,
        Weekday::Mon => 1,
        Weekday::Tue => 2,
        Weekday::Wed => 3,
        Weekday::Thu => 4,
        Weekday::Fri => 5,
        Weekday::Sat => 6,
    }
}

/// Calculates the next run time from now for a given cron expression.
/// Uses the local timezone.
pub fn calculate_next_run(cron_expr: &str) -> Option<String> {
    let now = Local::now().naive_local();
    let next = next_run_after(cron_expr, now)?;
    Some(next.format("%Y-%m-%d %H:%M:%S").to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_daily_cron() {
        // "30 8 * * *" = daily at 08:30
        let after = NaiveDateTime::parse_from_str("2026-02-14 07:00:00", "%Y-%m-%d %H:%M:%S").unwrap();
        let next = next_run_after("30 8 * * *", after).unwrap();
        assert_eq!(next.hour(), 8);
        assert_eq!(next.minute(), 30);
        assert_eq!(next.day(), 14); // Same day, still in future
    }

    #[test]
    fn test_daily_cron_past_today() {
        // "30 8 * * *" but it's already 09:00 — should be tomorrow
        let after = NaiveDateTime::parse_from_str("2026-02-14 09:00:00", "%Y-%m-%d %H:%M:%S").unwrap();
        let next = next_run_after("30 8 * * *", after).unwrap();
        assert_eq!(next.hour(), 8);
        assert_eq!(next.minute(), 30);
        assert_eq!(next.day(), 15); // Next day
    }

    #[test]
    fn test_weekly_cron() {
        // "0 10 * * 1" = Monday at 10:00
        // 2026-02-14 is a Saturday
        let after = NaiveDateTime::parse_from_str("2026-02-14 09:00:00", "%Y-%m-%d %H:%M:%S").unwrap();
        let next = next_run_after("0 10 * * 1", after).unwrap();
        assert_eq!(next.hour(), 10);
        assert_eq!(next.minute(), 0);
        // Next Monday after Feb 14 (Sat) is Feb 16
        assert_eq!(next.day(), 16);
    }

    #[test]
    fn test_hourly_cron() {
        // "0 * * * *" = every hour at :00
        let after = NaiveDateTime::parse_from_str("2026-02-14 09:30:00", "%Y-%m-%d %H:%M:%S").unwrap();
        let next = next_run_after("0 * * * *", after).unwrap();
        assert_eq!(next.hour(), 10);
        assert_eq!(next.minute(), 0);
    }
}
