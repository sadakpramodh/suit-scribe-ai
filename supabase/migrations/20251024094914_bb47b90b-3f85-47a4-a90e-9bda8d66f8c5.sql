-- Create disputes table
CREATE TABLE public.disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  dispute_type text NOT NULL CHECK (dispute_type IN ('Arbitration', 'Court', 'Labour', 'International')),
  value numeric NOT NULL CHECK (value > 0),
  notice_from text NOT NULL,
  notice_date date NOT NULL,
  reply_due_date date NOT NULL,
  responsible_user text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Response Sent', 'Closed')),
  document_paths text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes
CREATE POLICY "Users can view their own disputes"
ON public.disputes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disputes"
ON public.disputes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own disputes"
ON public.disputes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own disputes"
ON public.disputes
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for search performance
CREATE INDEX idx_disputes_company ON public.disputes USING gin(to_tsvector('english', company));
CREATE INDEX idx_disputes_user_id ON public.disputes(user_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);