-- Drop the existing check constraint that's blocking "atrasado"
ALTER TABLE public.service_providers 
DROP CONSTRAINT IF EXISTS service_providers_payment_status_check;

-- Add a new check constraint that allows all the status values we need
ALTER TABLE public.service_providers 
ADD CONSTRAINT service_providers_payment_status_check 
CHECK (payment_status IN ('pendente', 'pago', 'atrasado'));