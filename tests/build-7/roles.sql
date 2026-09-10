-- Disposable test logins are distinct authenticated DB principals. No production grants.
create role b7_producer login;
create role b7_evaluator login;
create role b7_actor login;
grant service_role to b7_producer;
grant ecb7_evaluator to b7_evaluator;
grant ecb7_executor to b7_actor;
