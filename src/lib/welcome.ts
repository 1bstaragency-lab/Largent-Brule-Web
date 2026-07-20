// Shared canonical welcome body used by the auto-welcome scheduled task,
// the welcome reconciliation cron, and the admin manual-send tab. If
// this ever changes, update the SKILL.md files in
// ~/Documents/Claude/Scheduled/largent-brule-auto-welcome/ and
// largent-brule-welcome-reconciliation/ to match.
export const WELCOME_BODY =
  "welcome to club l’argent brûlé.\nvip access — approved.\n\nnews, updates & early releases land here first.\n\n— L’B";

// E.164 helper used by every admin send path — international-aware
// implementation lives in src/lib/phone.ts.
export { toE164 } from './phone';
