create role b9_parent login;
create role b9_child login;
create role b9_observer login;
create role b9_writer login;
grant ecb9_parent to b9_parent;
grant ecb9_child to b9_child;
grant ecb9_observer to b9_observer;
grant ecb9_writer to b9_writer;
