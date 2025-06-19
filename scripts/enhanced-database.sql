-- Premunia CRM Database Schema
-- Schéma complet pour la plateforme CRM spécialisée mutuelle santé seniors

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'commercial');
CREATE TYPE prospect_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost');
CREATE TYPE prospect_segment AS ENUM ('senior_premium', 'senior_standard');
CREATE TYPE health_status AS ENUM ('excellent', 'good', 'average', 'poor');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE opportunity_stage AS ENUM ('discovery', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE campaign_type AS ENUM ('email', 'sms', 'call');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'commercial',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prospects table
CREATE TABLE public.prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 50 AND age <= 100),
    budget_monthly INTEGER NOT NULL CHECK (budget_monthly >= 30 AND budget_monthly <= 500),
    health_status health_status NOT NULL DEFAULT 'good',
    urgency_level urgency_level NOT NULL DEFAULT 'medium',
    score INTEGER NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    segment prospect_segment NOT NULL,
    status prospect_status NOT NULL DEFAULT 'new',
    assigned_to UUID REFERENCES public.users(id),
    source TEXT,
    notes TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE public.opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2) NOT NULL CHECK (value >= 0),
    stage opportunity_stage NOT NULL DEFAULT 'discovery',
    probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type campaign_type NOT NULL DEFAULT 'email',
    target_segment prospect_segment,
    status campaign_status NOT NULL DEFAULT 'draft',
    template_id TEXT,
    subject TEXT,
    content TEXT,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Recipients table
CREATE TABLE public.campaign_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, prospect_id)
);

-- Activities table (for tracking interactions)
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'note', etc.
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table (for email/SMS templates)
CREATE TABLE public.templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type campaign_type NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    target_segment prospect_segment,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_prospects_assigned_to ON public.prospects(assigned_to);
CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_segment ON public.prospects(segment);
CREATE INDEX idx_prospects_score ON public.prospects(score DESC);
CREATE INDEX idx_prospects_created_at ON public.prospects(created_at DESC);

CREATE INDEX idx_opportunities_assigned_to ON public.opportunities(assigned_to);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX idx_opportunities_prospect_id ON public.opportunities(prospect_id);
CREATE INDEX idx_opportunities_value ON public.opportunities(value DESC);

CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX idx_campaigns_type ON public.campaigns(type);

CREATE INDEX idx_activities_prospect_id ON public.activities(prospect_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_type ON public.activities(type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Prospects policies
CREATE POLICY "Admins can view all prospects" ON public.prospects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Managers can view all prospects" ON public.prospects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'manager'
        )
    );

CREATE POLICY "Commercials can view their assigned prospects" ON public.prospects
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can insert prospects" ON public.prospects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Users can update prospects they can view" ON public.prospects
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')
        )
    );

-- Similar policies for opportunities
CREATE POLICY "Users can view opportunities for their prospects" ON public.opportunities
    FOR SELECT USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.prospects 
            WHERE prospects.id = opportunities.prospect_id 
            AND (prospects.assigned_to = auth.uid() OR
                 EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')))
        )
    );

CREATE POLICY "Users can insert opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Users can update opportunities they can view" ON public.opportunities
    FOR UPDATE USING (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.prospects 
            WHERE prospects.id = opportunities.prospect_id 
            AND (prospects.assigned_to = auth.uid() OR
                 EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')))
        )
    );

-- Campaigns policies (only admins can manage campaigns)
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "All users can view active campaigns" ON public.campaigns
    FOR SELECT USING (status = 'active');

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON public.prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate prospect score
CREATE OR REPLACE FUNCTION calculate_prospect_score(
    p_age INTEGER,
    p_budget INTEGER,
    p_health_status health_status,
    p_urgency_level urgency_level
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 50; -- Base score
BEGIN
    -- Age scoring (seniors focus)
    IF p_age >= 60 AND p_age <= 75 THEN
        score := score + 20;
    ELSIF p_age > 75 THEN
        score := score + 15;
    END IF;
    
    -- Budget scoring
    IF p_budget >= 100 THEN
        score := score + 15;
    ELSIF p_budget >= 50 THEN
        score := score + 10;
    END IF;
    
    -- Health status scoring
    CASE p_health_status
        WHEN 'excellent' THEN score := score + 15;
        WHEN 'good' THEN score := score + 10;
        WHEN 'average' THEN score := score + 5;
        WHEN 'poor' THEN score := score + 0;
    END CASE;
    
    -- Urgency scoring
    CASE p_urgency_level
        WHEN 'high' THEN score := score + 10;
        WHEN 'medium' THEN score := score + 5;
        WHEN 'low' THEN score := score + 0;
    END CASE;
    
    -- Ensure score is within bounds
    IF score > 100 THEN score := 100; END IF;
    IF score < 0 THEN score := 0; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to determine prospect segment
CREATE OR REPLACE FUNCTION determine_prospect_segment(
    p_age INTEGER,
    p_budget INTEGER
) RETURNS prospect_segment AS $$
BEGIN
    IF p_budget >= 80 AND p_age >= 60 THEN
        RETURN 'senior_premium';
    ELSE
        RETURN 'senior_standard';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate score and segment on prospect insert/update
CREATE OR REPLACE FUNCTION auto_calculate_prospect_metrics()
RETURNS TRIGGER AS $$
BEGIN
    NEW.score := calculate_prospect_score(NEW.age, NEW.budget_monthly, NEW.health_status, NEW.urgency_level);
    NEW.segment := determine_prospect_segment(NEW.age, NEW.budget_monthly);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_prospect_metrics_trigger
    BEFORE INSERT OR UPDATE ON public.prospects
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_prospect_metrics();

-- Insert sample data for development
INSERT INTO public.users (id, email, role, first_name, last_name) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@premunia.com', 'admin', 'Admin', 'Premunia'),
    ('550e8400-e29b-41d4-a716-446655440001', 'manager@premunia.com', 'manager', 'Marie', 'Dubois'),
    ('550e8400-e29b-41d4-a716-446655440002', 'commercial@premunia.com', 'commercial', 'Jean', 'Martin');

-- Insert sample prospects
INSERT INTO public.prospects (first_name, last_name, email, phone, age, budget_monthly, health_status, urgency_level, assigned_to, source, notes) VALUES
    ('Pierre', 'Durand', 'pierre.durand@email.com', '0123456789', 67, 120, 'good', 'high', '550e8400-e29b-41d4-a716-446655440002', 'Site web', 'Intéressé par une mutuelle complète'),
    ('Marie', 'Leroy', 'marie.leroy@email.com', '0123456790', 72, 95, 'average', 'medium', '550e8400-e29b-41d4-a716-446655440002', 'Recommandation', 'Problèmes de vue, cherche bonne couverture optique'),
    ('Jacques', 'Bernard', 'jacques.bernard@email.com', '0123456791', 69, 150, 'excellent', 'low', '550e8400-e29b-41d4-a716-446655440002', 'Publicité Facebook', 'Budget élevé, veut le meilleur'),
    ('Françoise', 'Petit', 'francoise.petit@email.com', '0123456792', 74, 80, 'good', 'high', '550e8400-e29b-41d4-a716-446655440002', 'Salon senior', 'Urgence pour hospitalisation prévue'),
    ('Robert', 'Moreau', 'robert.moreau@email.com', '0123456793', 66, 110, 'poor', 'high', '550e8400-e29b-41d4-a716-446655440002', 'Bouche à oreille', 'Diabète, besoins spécifiques');

-- Insert sample opportunities
INSERT INTO public.opportunities (prospect_id, title, description, value, stage, probability, expected_close_date, assigned_to) VALUES
    ((SELECT id FROM public.prospects WHERE email = 'pierre.durand@email.com'), 'Mutuelle Premium Pierre Durand', 'Mutuelle complète avec garanties renforcées', 1440, 'proposal', 80, '2024-07-15', '550e8400-e29b-41d4-a716-446655440002'),
    ((SELECT id FROM public.prospects WHERE email = 'marie.leroy@email.com'), 'Mutuelle Optique Marie Leroy', 'Mutuelle avec focus sur couverture optique', 1140, 'needs_analysis', 60, '2024-07-20', '550e8400-e29b-41d4-a716-446655440002'),
    ((SELECT id FROM public.prospects WHERE email = 'jacques.bernard@email.com'), 'Mutuelle Haut de Gamme Jacques Bernard', 'Mutuelle premium toutes garanties', 1800, 'discovery', 40, '2024-08-01', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample templates
INSERT INTO public.templates (name, type, subject, content, target_segment, created_by) VALUES
    ('Bienvenue Senior Premium', 'email', 'Bienvenue chez Premunia - Votre mutuelle santé seniors', 
     'Bonjour {first_name}, Bienvenue dans notre programme mutuelle santé spécialement conçu pour les seniors. Découvrez nos garanties renforcées...', 
     'senior_premium', '550e8400-e29b-41d4-a716-446655440000'),
    ('Rappel Devis', 'email', 'Votre devis mutuelle santé vous attend', 
     'Bonjour {first_name}, Votre devis personnalisé est prêt. N''hésitez pas à nous contacter pour toute question...', 
     NULL, '550e8400-e29b-41d4-a716-446655440000'),
    ('SMS Urgence', 'sms', '', 
     'Bonjour {first_name}, votre mutuelle santé senior vous attend. Réponse rapide garantie. Appelez le 01.XX.XX.XX.XX', 
     NULL, '550e8400-e29b-41d4-a716-446655440000');

-- Create view for analytics
CREATE VIEW public.analytics_view AS
SELECT 
    COUNT(CASE WHEN p.status IN ('closed_won') THEN 1 END) as total_conversions,
    COUNT(*) as total_prospects,
    AVG(p.age) as avg_age,
    AVG(p.budget_monthly) as avg_budget,
    AVG(p.score) as avg_score,
    SUM(CASE WHEN o.stage = 'closed_won' THEN o.value ELSE 0 END) as total_revenue,
    COUNT(CASE WHEN p.segment = 'senior_premium' THEN 1 END) as premium_count,
    COUNT(CASE WHEN p.segment = 'senior_standard' THEN 1 END) as standard_count
FROM public.prospects p
LEFT JOIN public.opportunities o ON p.id = o.prospect_id;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.analytics_view TO authenticated;
