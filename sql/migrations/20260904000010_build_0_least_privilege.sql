-- BUILD 0 — least-privilege correction
-- STRUCTURAL / authorization check: the runtime may capture and retrieve,
-- but BUILD 0 exposes no update or delete behavior.

revoke all on table public.thoughts from service_role;
grant select, insert on table public.thoughts to service_role;
