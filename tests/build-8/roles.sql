-- Distinct protected authentication contexts, fixture-local trust only.
create role b8_actor login;
create role b8_other login;
create role b8_evaluator login;
create role b8_observer login;
grant ecb8_executor to b8_actor,b8_other;
grant ecb8_evaluator to b8_evaluator;
grant ecb8_observer to b8_observer;
