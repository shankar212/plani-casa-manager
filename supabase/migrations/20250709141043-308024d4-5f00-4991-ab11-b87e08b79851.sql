-- Insert dummy projects
INSERT INTO public.projects (id, name, description, status, start_date, end_date, total_budget) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'apartamento hillrid', 'Reforma completa de apartamento\nCliente: João Silva\nEngenheiro: Maria Santos\nEquipe: Equipe Alpha Construction', 'Em andamento', '2024-08-01', '2025-02-01', 450000.00),
('550e8400-e29b-41d4-a716-446655440001', 'ulisses faria 970', 'Construção residencial\nCliente: Ana Costa\nArquiteto: Pedro Lima\nEquipe: Construtora Beta', 'Em andamento', '2024-12-10', '2025-08-15', 750000.00),
('550e8400-e29b-41d4-a716-446655440002', 'curitibapolloce', 'Projeto comercial\nCliente: Empresa XYZ Ltda\nEngenheiro: Carlos Mendes\nEquipe: Construtora Gamma', 'Pré-projeto', '2024-11-01', '2025-05-30', 320000.00);

-- Insert dummy project stages for project 1 (apartamento hillrid)
INSERT INTO public.project_stages (id, project_id, name, description, status, start_date, estimated_duration_days, progress_percentage, estimated_cost, actual_cost) VALUES
('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Alvenaria', 'Construção das paredes e estruturas básicas', 'finalizado', '2024-08-01', 30, 100, 87000.00, 89500.00),
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Cobertura', 'Instalação da cobertura e telhado', 'andamento', '2024-09-01', 45, 75, 120000.00, NULL),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Acabamento', 'Acabamentos finais e pintura', 'proximo', '2024-11-15', 60, 0, 200000.00, NULL),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Instalações Elétricas', 'Sistema elétrico completo', 'proximo', '2024-10-01', 25, 0, 45000.00, NULL);

-- Insert dummy project stages for project 2 (ulisses faria 970)  
INSERT INTO public.project_stages (id, project_id, name, description, status, start_date, estimated_duration_days, progress_percentage, estimated_cost) VALUES
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Fundação', 'Escavação e fundação da obra', 'andamento', '2024-12-10', 20, 60, 150000.00),
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Estrutura', 'Pilares e vigas de concreto', 'proximo', '2025-01-15', 40, 0, 280000.00),
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Cobertura', 'Laje e telhado', 'proximo', '2025-03-01', 30, 0, 180000.00);

-- Insert dummy project stages for project 3 (curitibapolloce)
INSERT INTO public.project_stages (id, project_id, name, description, status, start_date, estimated_duration_days, progress_percentage, estimated_cost) VALUES
('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', 'Planejamento', 'Análise de viabilidade e projetos', 'andamento', '2024-11-01', 15, 80, 25000.00),
('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Preparação do Terreno', 'Limpeza e preparação', 'proximo', '2024-12-01', 10, 0, 15000.00);

-- Insert dummy tasks for Alvenaria (finished stage)
INSERT INTO public.project_tasks (id, stage_id, name, description, completed) VALUES
('750e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', 'Assentamento blocos', 'Assentamento de blocos cerâmicos', true),
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', 'Concretagem Colunas', 'Concretagem das colunas estruturais', true),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000', 'Verificação Prumo', 'Verificação do prumo das paredes', true);

-- Insert dummy tasks for Cobertura (in progress stage)
INSERT INTO public.project_tasks (id, stage_id, name, description, completed) VALUES
('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001', 'Concretagem Laje', 'Concretagem da laje de cobertura', true),
('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440001', 'Madeiramento', 'Instalação da estrutura de madeira', true),
('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440001', 'Colocação Telhado', 'Instalação das telhas', false),
('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', 'Calhas e Rufos', 'Instalação do sistema de águas pluviais', false);

-- Insert dummy tasks for Acabamento (upcoming stage)
INSERT INTO public.project_tasks (id, stage_id, name, description, completed) VALUES
('750e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440002', 'Assentamento pisos', 'Instalação dos pisos cerâmicos', false),
('750e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440002', 'Pintura Interna', 'Pintura das paredes internas', false),
('750e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440002', 'Instalação Portas', 'Instalação das portas internas', false);

-- Insert dummy tasks for Instalações Elétricas (upcoming stage)
INSERT INTO public.project_tasks (id, stage_id, name, description, completed) VALUES
('750e8400-e29b-41d4-a716-446655440030', '650e8400-e29b-41d4-a716-446655440003', 'Passagem de Fios', 'Passagem dos cabos elétricos', false),
('750e8400-e29b-41d4-a716-446655440031', '650e8400-e29b-41d4-a716-446655440003', 'Instalação Quadro', 'Instalação do quadro elétrico principal', false);

-- Insert dummy tasks for other projects
INSERT INTO public.project_tasks (id, stage_id, name, description, completed) VALUES
('750e8400-e29b-41d4-a716-446655440040', '650e8400-e29b-41d4-a716-446655440010', 'Escavação', 'Escavação para fundação', true),
('750e8400-e29b-41d4-a716-446655440041', '650e8400-e29b-41d4-a716-446655440010', 'Armação Sapatas', 'Armação das sapatas de fundação', true),
('750e8400-e29b-41d4-a716-446655440042', '650e8400-e29b-41d4-a716-446655440010', 'Concretagem Fundação', 'Concretagem das fundações', false),

('750e8400-e29b-41d4-a716-446655440050', '650e8400-e29b-41d4-a716-446655440020', 'Análise Viabilidade', 'Estudo de viabilidade técnica', true),
('750e8400-e29b-41d4-a716-446655440051', '650e8400-e29b-41d4-a716-446655440020', 'Projeto Arquitetônico', 'Desenvolvimento do projeto arquitetônico', true),
('750e8400-e29b-41d4-a716-446655440052', '650e8400-e29b-41d4-a716-446655440020', 'Aprovações Legais', 'Obtenção de licenças e aprovações', false);