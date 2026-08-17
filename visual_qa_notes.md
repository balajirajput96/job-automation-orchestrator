# Visual QA Notes

## Desktop verification — 17 August 2026

The dashboard renders successfully after the public workflow query resolves. The deep green operational palette, hierarchy, permanent exclusion banner, schedule configuration, integration status, candidate profile, application log, and run-history feed are visible in the 1440px desktop capture. The application table is intentionally scrollable to preserve all audited records without compressing long recipient emails or Gmail message IDs.

The only observed authentication-dependent behavior is expected: the schedule control reports that sign-in is required when no dashboard session is present. The manual trigger remains gated by its confirmation dialog and the server-side confirmed input contract.

## Final desktop verification — 17 August 2026

The updated layout preserves the refined deep-green command-center treatment while adding the Control activity panel below the schedule. The permanent exclusion is still prominent at the top of the operational view; all required schedule labels use IST and the expiry is rendered as `13 Oct 2026`. The responsive capture previously verified the stacked mobile layout and horizontally contained application table.
