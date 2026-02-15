
-- Migration 006: Webhook Worker Locking & Error Handling
-- 1. Add error_msg column if not exists
ALTER TABLE public.webhook_events 
ADD COLUMN IF NOT EXISTS error_msg text;

-- 2. Ensure defaults
ALTER TABLE public.webhook_events 
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN attempts SET DEFAULT 0;

-- 3. Index for filtering pending events
CREATE INDEX IF NOT EXISTS idx_webhook_events_pending_created 
ON public.webhook_events (created_at) 
WHERE status = 'pending';

-- 4. Atomic Claim Function (Standard Name)
DROP FUNCTION IF EXISTS public.claim_webhook_events;
DROP FUNCTION IF EXISTS public.claim_webhook_events_v2;

CREATE OR REPLACE FUNCTION public.claim_webhook_events(
  batch_size integer,
  worker_id text
)
RETURNS SETOF public.webhook_events
LANGUAGE sql
AS $function$
  WITH claimed AS (
    UPDATE public.webhook_events
    SET
      status = 'processing',
      locked_at = now(),
      locked_by = worker_id,
      attempts = COALESCE(attempts, 0) + 1
    WHERE id IN (
      SELECT id
      FROM public.webhook_events
      WHERE status = 'pending'
      -- Logic: Pending items that are either not locked or lock expired (2 min timeout)
      AND (locked_at IS NULL OR locked_at < now() - interval '2 minutes')
      ORDER BY created_at ASC
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  )
  SELECT * FROM claimed;
$function$;
