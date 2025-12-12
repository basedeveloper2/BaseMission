alter table users enable row level security;
alter table quests enable row level security;
alter table participations enable row level security;

create policy p_users_read for select on users using (true);
create policy p_quests_read for select on quests using (true);
create policy p_participations_read for select on participations using (true);
