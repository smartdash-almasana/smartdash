
-- Migration 008: Question Snapshots
CREATE TABLE IF NOT EXISTS public.question_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid NOT NULL,
    question_id text NOT NULL UNIQUE,
    status text,
    date_created timestamptz,
    item_id text,
    from_id text,
    raw_payload jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_snapshots_seller ON public.question_snapshots(seller_id);
CREATE INDEX IF NOT EXISTS idx_question_snapshots_status ON public.question_snapshots(status);
