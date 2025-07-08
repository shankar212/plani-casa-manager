-- Create enums
CREATE TYPE public.project_status AS ENUM ('Pré-projeto', 'Projeto', 'Obras', 'Pós obra', 'Financiamento');
CREATE TYPE public.stage_status AS ENUM ('finalizado', 'andamento', 'proximo');

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'Pré-projeto',
    total_budget DECIMAL(15,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_stages table (etapas)
CREATE TABLE public.project_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    estimated_duration_days INTEGER,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    estimated_cost DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    status stage_status NOT NULL DEFAULT 'proximo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_tasks table (tarefas)
CREATE TABLE public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create legal_documents table
CREATE TABLE public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    sector TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create service_providers table
CREATE TABLE public.service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    contract_value DECIMAL(15,2) NOT NULL,
    payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('pago', 'pendente', 'parcial')),
    contract_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create material_suppliers table
CREATE TABLE public.material_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create materials_requested table
CREATE TABLE public.materials_requested (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    estimated_unit_cost DECIMAL(10,2),
    estimated_total_cost DECIMAL(15,2),
    supplier_id UUID REFERENCES public.material_suppliers(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create materials_delivered table
CREATE TABLE public.materials_delivered (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    supplier_id UUID REFERENCES public.material_suppliers(id),
    delivery_date DATE NOT NULL,
    invoice_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create materials_used table
CREATE TABLE public.materials_used (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    used_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for legal documents
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-documents', 'legal-documents', true);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials_requested ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials_delivered ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials_used ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for now - can be restricted later)
-- Projects
CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.projects FOR DELETE USING (true);

-- Project stages
CREATE POLICY "Enable read access for all users" ON public.project_stages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.project_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.project_stages FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.project_stages FOR DELETE USING (true);

-- Project tasks
CREATE POLICY "Enable read access for all users" ON public.project_tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.project_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.project_tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.project_tasks FOR DELETE USING (true);

-- Legal documents
CREATE POLICY "Enable read access for all users" ON public.legal_documents FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.legal_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.legal_documents FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.legal_documents FOR DELETE USING (true);

-- Service providers
CREATE POLICY "Enable read access for all users" ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.service_providers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.service_providers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.service_providers FOR DELETE USING (true);

-- Material suppliers
CREATE POLICY "Enable read access for all users" ON public.material_suppliers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.material_suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.material_suppliers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.material_suppliers FOR DELETE USING (true);

-- Materials requested
CREATE POLICY "Enable read access for all users" ON public.materials_requested FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.materials_requested FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.materials_requested FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.materials_requested FOR DELETE USING (true);

-- Materials delivered
CREATE POLICY "Enable read access for all users" ON public.materials_delivered FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.materials_delivered FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.materials_delivered FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.materials_delivered FOR DELETE USING (true);

-- Materials used
CREATE POLICY "Enable read access for all users" ON public.materials_used FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.materials_used FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.materials_used FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.materials_used FOR DELETE USING (true);

-- Storage policies for legal documents
CREATE POLICY "Anyone can view legal documents" ON storage.objects FOR SELECT USING (bucket_id = 'legal-documents');
CREATE POLICY "Anyone can upload legal documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'legal-documents');
CREATE POLICY "Anyone can update legal documents" ON storage.objects FOR UPDATE USING (bucket_id = 'legal-documents');
CREATE POLICY "Anyone can delete legal documents" ON storage.objects FOR DELETE USING (bucket_id = 'legal-documents');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_stages_updated_at BEFORE UPDATE ON public.project_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_material_suppliers_updated_at BEFORE UPDATE ON public.material_suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();