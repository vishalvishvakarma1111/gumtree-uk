-- Enable Supabase Realtime on chat tables.
-- Required for postgres_changes subscriptions in chat-thread.tsx and Header
-- unread badge to receive live INSERT/UPDATE events.

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- REPLICA IDENTITY FULL so UPDATE payloads include old row (needed to
-- detect read_at transitions on client).
ALTER TABLE messages REPLICA IDENTITY FULL;
