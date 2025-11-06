-- Create litigation timeline events table
CREATE TABLE public.litigation_timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.litigation_cases(id) ON DELETE CASCADE,
  stage_type TEXT NOT NULL, -- 'filed', 'hearing', 'judgment', 'appeal'
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  summary TEXT,
  hearing_number INTEGER, -- for hearing stages (1, 2, 3, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.litigation_timeline_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Approved users can view timeline events for their cases"
ON public.litigation_timeline_events
FOR SELECT
USING (
  is_user_approved(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.litigation_cases
    WHERE id = case_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Approved users can insert timeline events for their cases"
ON public.litigation_timeline_events
FOR INSERT
WITH CHECK (
  is_user_approved(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.litigation_cases
    WHERE id = case_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Approved users can update timeline events for their cases"
ON public.litigation_timeline_events
FOR UPDATE
USING (
  is_user_approved(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.litigation_cases
    WHERE id = case_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Approved users can delete timeline events for their cases"
ON public.litigation_timeline_events
FOR DELETE
USING (
  is_user_approved(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.litigation_cases
    WHERE id = case_id AND user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_litigation_timeline_events_updated_at
BEFORE UPDATE ON public.litigation_timeline_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_timeline_events_case_id ON public.litigation_timeline_events(case_id);
CREATE INDEX idx_timeline_events_event_date ON public.litigation_timeline_events(event_date);