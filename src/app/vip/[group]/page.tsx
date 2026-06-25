// Dynamic VIP group route: /vip/group-1 … /vip/group-42
// Reuses the same EarlyAccessPage component as /vip — it reads the
// `group` route param to resolve the group-specific access code.
export { default } from "../page";
