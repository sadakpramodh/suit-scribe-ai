-- Create enums for risk rating and court types
CREATE TYPE public.risk_rating AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.court_type AS ENUM ('high_court', 'district_court', 'magistrate_court', 'supreme_court', 'tribunal', 'arbitration');
CREATE TYPE public.case_type AS ENUM ('civil', 'criminal', 'labour', 'regulatory', 'tax', 'intellectual_property', 'corporate');

-- Enhanced DISPUTES table (Pre-Litigation/Notices)
ALTER TABLE public.disputes
ADD COLUMN subsidiary text,
ADD COLUMN unit text,
ADD COLUMN relief_sought text,
ADD COLUMN relevant_law text,
ADD COLUMN risk_rating risk_rating DEFAULT 'medium',
ADD COLUMN state text,
ADD COLUMN city text,
ADD COLUMN brief_facts text,
ADD COLUMN assigned_legal_officer text,
ADD COLUMN reporting_manager text,
ADD COLUMN provision_in_books numeric,
ADD COLUMN contingent_liability numeric,
ADD COLUMN company_law_firm text,
ADD COLUMN opposite_party_law_firm text,
ADD COLUMN sub_category text,
ADD COLUMN department text,
ADD COLUMN receipt_date date,
ADD COLUMN category text;

-- Enhanced LITIGATION_CASES table
ALTER TABLE public.litigation_cases
ADD COLUMN subsidiary text,
ADD COLUMN unit text,
ADD COLUMN region text,
ADD COLUMN case_type case_type,
ADD COLUMN case_year integer,
ADD COLUMN cnr_number text,
ADD COLUMN kmp_involved boolean DEFAULT false,
ADD COLUMN authorized_signatory text,
ADD COLUMN legal_nature text,
ADD COLUMN legal_sub_nature text,
ADD COLUMN interest_amount numeric,
ADD COLUMN penalties numeric,
ADD COLUMN provision_in_books numeric,
ADD COLUMN contingent_liability numeric,
ADD COLUMN company_law_firm text,
ADD COLUMN opposite_party_law_firm text,
ADD COLUMN state text,
ADD COLUMN city text,
ADD COLUMN district text,
ADD COLUMN bench text,
ADD COLUMN court_type court_type,
ADD COLUMN risk_rating risk_rating DEFAULT 'medium',
ADD COLUMN prayers text,
ADD COLUMN issues text;

-- Add indexes for better filtering performance
CREATE INDEX IF NOT EXISTS idx_disputes_risk_rating ON public.disputes(risk_rating);
CREATE INDEX IF NOT EXISTS idx_disputes_state ON public.disputes(state);
CREATE INDEX IF NOT EXISTS idx_disputes_subsidiary ON public.disputes(subsidiary);
CREATE INDEX IF NOT EXISTS idx_disputes_category ON public.disputes(category);
CREATE INDEX IF NOT EXISTS idx_disputes_department ON public.disputes(department);

CREATE INDEX IF NOT EXISTS idx_litigation_risk_rating ON public.litigation_cases(risk_rating);
CREATE INDEX IF NOT EXISTS idx_litigation_state ON public.litigation_cases(state);
CREATE INDEX IF NOT EXISTS idx_litigation_subsidiary ON public.litigation_cases(subsidiary);
CREATE INDEX IF NOT EXISTS idx_litigation_case_type ON public.litigation_cases(case_type);
CREATE INDEX IF NOT EXISTS idx_litigation_court_type ON public.litigation_cases(court_type);