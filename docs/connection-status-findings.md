# Connection Status Findings

**Checked:** 18 August 2026, 09:32 IST

| Surface | Observed status | Scope and limitation |
|---|---|---|
| GitHub CLI | Authenticated as `balajirajput96` | Repository audit and CI inspection are available through the command-line integration. No credential values were viewed or recorded. |
| Browser page: GitHub | Logged out | The browser displayed GitHub's public homepage with **Sign in** and **Sign up** controls. This does not affect GitHub CLI access. |
| My Browser connector | Enabled | It can access the user's browser session where an authenticated session exists. This check does not enumerate private browser cookies, passwords, or every saved account. |
| Anchor Browser | Disabled | No browser session is active through this connector. |
| Playwright connector | Enabled | It is a browser-automation capability, not evidence of a separate website account login. |
| Gmail connector | Enabled and active for `balajirajput968@gmail.com` | This is the active application-sending account for the verified job workflow. |
| Google Calendar and Google Workspace connectors | Enabled with `balajirajput968@gmail.com` known | Neither connector reported a selected active account in this check; this is not the same as a browser login. |
| Meta Ads Manager connector | Enabled with `balajidilip930@gmail.com` known | No active account was selected during this check; it was not used in the job workflow. |

No configured or observed service is named **Thug**. No standalone account called **Account Integrity** was observed in the checked task configuration. This record intentionally excludes secrets, tokens, passwords, cookie values, and uninspected browser-account claims.
