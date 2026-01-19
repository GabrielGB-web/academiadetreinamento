-- Fix quiz_questions exposure: Create a public view without correct_option
-- and restrict direct table access

-- Create a view that excludes the correct_option for public access
CREATE VIEW public.quiz_questions_public
WITH (security_invoker = on) AS
SELECT 
  id,
  quiz_id,
  question_text,
  options,
  order_index,
  explanation,
  created_at
FROM public.quiz_questions;

-- Drop the permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;

-- Create restrictive SELECT policy that only allows admins to see correct_option directly
CREATE POLICY "Only admins can view quiz questions directly" 
ON public.quiz_questions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));