-- Premunia CRM - Base de données complète
-- Plateforme CRM spécialisée mutuelle santé seniors

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'commercial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prospect_status AS ENUM ('nouveau', 'contacte', 'qualifie', 'devis', 'signe', 'perdu');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prospect_segment AS ENUM ('senior_premium', 'senior_standard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE health_status AS ENUM ('excellent', 'bon', 'moyen', 'fragile');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('faible', 'moyenne', 'elevee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('en_attente', 'en_cours', 'terminee', 'annulee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('planifie', 'confirme', 'reporte', 'annule', 'termine');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM ('telephone', 'visio', 'domicile', 'bureau');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE automation_type AS ENUM ('email_bienvenue', 'relance_email', 'anniversaire', 'cross_selling', 'personnalise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE import_type AS ENUM ('excel', 'google_sheets', 'hubspot');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table des profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'commercial',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des prospects
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    date_naissance TEXT NOT NULL, -- Format DD/MM/YYYY
    age INTEGER GENERATED ALWAYS AS (
        EXTRACT(YEAR FROM AGE(
            TO_DATE(SUBSTRING(date_naissance, 7, 4) || '-' || 
                    SUBSTRING(date_naissance, 4, 2) || '-' || 
                    SUBSTRING(date_naissance, 1, 2), 'YYYY-MM-DD')
        ))
    ) STORED,
    budget_mensuel INTEGER NOT NULL CHECK (budget_mensuel >= 30 AND budget_mensuel <= 500),
    etat_sante health_status NOT NULL DEFAULT 'bon',
    niveau_urgence urgency_level NOT NULL DEFAULT 'moyenne',
    score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    segment prospect_segment,
    statut prospect_status NOT NULL DEFAULT 'nouveau',
    assigned_to UUID REFERENCES public.profiles(id),
    source TEXT,
    notes TEXT,
    adresse TEXT,
    ville TEXT,
    code_postal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des clients (prospects convertis)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prospect_id UUID REFERENCES public.prospects(id),
    numero_contrat TEXT UNIQUE NOT NULL,
    type_mutuelle TEXT NOT NULL,
    prime_mensuelle DECIMAL(10,2) NOT NULL,
    date_souscription DATE NOT NULL,
    date_effet DATE NOT NULL,
    commercial_id UUID REFERENCES public.profiles(id),
    statut_contrat TEXT DEFAULT 'actif',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titre TEXT NOT NULL,
    description TEXT,
    statut task_status NOT NULL DEFAULT 'en_attente',
    priorite TEXT CHECK (priorite IN ('faible', 'normale', 'elevee')) DEFAULT 'normale',
    date_echeance TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.profiles(id),
    prospect_id UUID REFERENCES public.prospects(id),
    client_id UUID REFERENCES public.clients(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titre TEXT NOT NULL,
    description TEXT,
    date_rdv TIMESTAMP WITH TIME ZONE NOT NULL,
    duree_minutes INTEGER DEFAULT 60,
    type_rdv appointment_type NOT NULL DEFAULT 'telephone',
    statut appointment_status NOT NULL DEFAULT 'planifie',
    commercial_id UUID REFERENCES public.profiles(id),
    prospect_id UUID REFERENCES public.prospects(id),
    client_id UUID REFERENCES public.clients(id),
    adresse_rdv TEXT,
    lien_visio TEXT,
    notes TEXT,
    rappel_envoye BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des scénarios d'automatisation
CREATE TABLE IF NOT EXISTS public.automation_scenarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nom TEXT NOT NULL,
    description TEXT,
    type automation_type NOT NULL,
    statut TEXT CHECK (statut IN ('actif', 'inactif', 'brouillon')) DEFAULT 'brouillon',
    conditions JSONB,
    actions JSONB,
    delai_minutes INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des templates d'emails
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nom TEXT NOT NULL,
    sujet TEXT NOT NULL,
    contenu_html TEXT NOT NULL,
    contenu_text TEXT,
    variables JSONB,
    type automation_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des exécutions d'automatisation
CREATE TABLE IF NOT EXISTS public.automation_executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scenario_id UUID REFERENCES public.automation_scenarios(id) ON DELETE CASCADE,
    prospect_id UUID REFERENCES public.prospects(id),
    client_id UUID REFERENCES public.clients(id),
    statut TEXT CHECK (statut IN ('en_attente', 'en_cours', 'envoye', 'echec', 'annule')) DEFAULT 'en_attente',
    date_programmee TIMESTAMP WITH TIME ZONE,
    date_execution TIMESTAMP WITH TIME ZONE,
    resultat JSONB,
    erreur TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des objectifs commerciaux
CREATE TABLE IF NOT EXISTS public.commercial_objectives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    commercial_id UUID REFERENCES public.profiles(id),
    periode_type TEXT CHECK (periode_type IN ('mensuel', 'trimestriel', 'annuel')) NOT NULL,
    periode_valeur TEXT NOT NULL,
    objectif_ca DECIMAL(12,2),
    objectif_prospects INTEGER,
    objectif_conversions INTEGER,
    objectif_rdv INTEGER,
    ca_realise DECIMAL(12,2) DEFAULT 0,
    prospects_realises INTEGER DEFAULT 0,
    conversions_realisees INTEGER DEFAULT 0,
    rdv_realises INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(commercial_id, periode_type, periode_valeur)
);

-- Table des statistiques de performance
CREATE TABLE IF NOT EXISTS public.performance_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    commercial_id UUID REFERENCES public.profiles(id),
    date_stat DATE NOT NULL,
    prospects_nouveaux INTEGER DEFAULT 0,
    prospects_convertis INTEGER DEFAULT 0,
    ca_genere DECIMAL(12,2) DEFAULT 0,
    appels_effectues INTEGER DEFAULT 0,
    emails_envoyes INTEGER DEFAULT 0,
    rdv_planifies INTEGER DEFAULT 0,
    rdv_honores INTEGER DEFAULT 0,
    taux_conversion DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(commercial_id, date_stat)
);

-- Table des imports de données
CREATE TABLE IF NOT EXISTS public.data_imports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type_import import_type NOT NULL,
    nom_fichier TEXT,
    statut TEXT CHECK (statut IN ('en_cours', 'termine', 'echec')) DEFAULT 'en_cours',
    total_lignes INTEGER DEFAULT 0,
    lignes_traitees INTEGER DEFAULT 0,
    lignes_erreur INTEGER DEFAULT 0,
    erreurs JSONB,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements marketing
CREATE TABLE IF NOT EXISTS public.marketing_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type_evenement TEXT NOT NULL,
    prospect_id UUID REFERENCES public.prospects(id),
    client_id UUID REFERENCES public.clients(id),
    commercial_id UUID REFERENCES public.profiles(id),
    scenario_id UUID REFERENCES public.automation_scenarios(id),
    donnees_evenement JSONB,
    date_evenement TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_prospects_assigned_to ON public.prospects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospects_statut ON public.prospects(statut);
CREATE INDEX IF NOT EXISTS idx_prospects_segment ON public.prospects(segment);
CREATE INDEX IF NOT EXISTS idx_prospects_score ON public.prospects(score DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON public.prospects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_date_echeance ON public.tasks(date_echeance);
CREATE INDEX IF NOT EXISTS idx_tasks_statut ON public.tasks(statut);

CREATE INDEX IF NOT EXISTS idx_appointments_commercial_id ON public.appointments(commercial_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_rdv ON public.appointments(date_rdv);
CREATE INDEX IF NOT EXISTS idx_appointments_statut ON public.appointments(statut);

CREATE INDEX IF NOT EXISTS idx_automation_executions_date ON public.automation_executions(date_programmee);
CREATE INDEX IF NOT EXISTS idx_automation_executions_statut ON public.automation_executions(statut);

CREATE INDEX IF NOT EXISTS idx_performance_stats_commercial_date ON public.performance_stats(commercial_id, date_stat);
CREATE INDEX IF NOT EXISTS idx_marketing_events_type ON public.marketing_events(type_evenement);
CREATE INDEX IF NOT EXISTS idx_marketing_events_date ON public.marketing_events(date_evenement);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies pour prospects
CREATE POLICY "Admins can view all prospects" ON public.prospects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Managers can view all prospects" ON public.prospects FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manager')
);
CREATE POLICY "Commercials can view their prospects" ON public.prospects FOR SELECT USING (
    assigned_to = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can insert prospects" ON public.prospects FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update their prospects" ON public.prospects FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies pour clients
CREATE POLICY "Users can view relevant clients" ON public.clients FOR SELECT USING (
    commercial_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can insert clients" ON public.clients FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update relevant clients" ON public.clients FOR UPDATE USING (
    commercial_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies pour tasks
CREATE POLICY "Users can view their tasks" ON public.tasks FOR SELECT USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update their tasks" ON public.tasks FOR UPDATE USING (
    assigned_to = auth.uid() OR created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies pour appointments
CREATE POLICY "Users can view their appointments" ON public.appointments FOR SELECT USING (
    commercial_id = auth.uid() OR created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can insert appointments" ON public.appointments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update their appointments" ON public.appointments FOR UPDATE USING (
    commercial_id = auth.uid() OR created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies pour automation (admin seulement)
CREATE POLICY "Admins can manage automation" ON public.automation_scenarios FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view active scenarios" ON public.automation_scenarios FOR SELECT USING (statut = 'actif');

CREATE POLICY "Admins can manage templates" ON public.email_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view active templates" ON public.email_templates FOR SELECT USING (is_active = true);

-- RLS Policies pour objectives
CREATE POLICY "Admins can manage objectives" ON public.commercial_objectives FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Commercials can view their objectives" ON public.commercial_objectives FOR SELECT USING (
    commercial_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies pour stats
CREATE POLICY "Users can view relevant stats" ON public.performance_stats FOR SELECT USING (
    commercial_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies pour imports
CREATE POLICY "Users can view their imports" ON public.data_imports FOR SELECT USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Users can create imports" ON public.data_imports FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
);

-- RLS Policies pour marketing events
CREATE POLICY "Users can view relevant events" ON public.marketing_events FOR SELECT USING (
    commercial_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_scenarios_updated_at BEFORE UPDATE ON public.automation_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commercial_objectives_updated_at BEFORE UPDATE ON public.commercial_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_imports_updated_at BEFORE UPDATE ON public.data_imports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le score prospect
CREATE OR REPLACE FUNCTION calculate_prospect_score(
    p_age INTEGER,
    p_budget INTEGER,
    p_etat_sante health_status,
    p_niveau_urgence urgency_level
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 50;
BEGIN
    -- Scoring par âge (focus seniors)
    IF p_age >= 60 AND p_age <= 75 THEN
        score := score + 20;
    ELSIF p_age > 75 THEN
        score := score + 15;
    END IF;
    
    -- Scoring par budget
    IF p_budget >= 100 THEN
        score := score + 15;
    ELSIF p_budget >= 50 THEN
        score := score + 10;
    END IF;
    
    -- Scoring par état de santé
    CASE p_etat_sante
        WHEN 'excellent' THEN score := score + 15;
        WHEN 'bon' THEN score := score + 10;
        WHEN 'moyen' THEN score := score + 5;
        WHEN 'fragile' THEN score := score + 0;
    END CASE;
    
    -- Scoring par urgence
    CASE p_niveau_urgence
        WHEN 'elevee' THEN score := score + 10;
        WHEN 'moyenne' THEN score := score + 5;
        WHEN 'faible' THEN score := score + 0;
    END CASE;
    
    -- Limiter le score entre 0 et 100
    IF score > 100 THEN score := 100; END IF;
    IF score < 0 THEN score := 0; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour déterminer le segment
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

-- Trigger pour calculer automatiquement score et segment
CREATE OR REPLACE FUNCTION auto_calculate_prospect_metrics()
RETURNS TRIGGER AS $$
DECLARE
    calculated_age INTEGER;
BEGIN
    -- Calculer l'âge à partir de la date de naissance
    calculated_age := EXTRACT(YEAR FROM AGE(
        TO_DATE(SUBSTRING(NEW.date_naissance, 7, 4) || '-' || 
                SUBSTRING(NEW.date_naissance, 4, 2) || '-' || 
                SUBSTRING(NEW.date_naissance, 1, 2), 'YYYY-MM-DD')
    ));
    
    NEW.score := calculate_prospect_score(calculated_age, NEW.budget_mensuel, NEW.etat_sante, NEW.niveau_urgence);
    NEW.segment := determine_prospect_segment(calculated_age, NEW.budget_mensuel);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_prospect_metrics_trigger
    BEFORE INSERT OR UPDATE ON public.prospects
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_prospect_metrics();

-- Fonction pour calculer le taux de conversion
CREATE OR REPLACE FUNCTION calculate_conversion_rate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.prospects_nouveaux > 0 THEN
        NEW.taux_conversion = (NEW.prospects_convertis::DECIMAL / NEW.prospects_nouveaux::DECIMAL) * 100;
    ELSE
        NEW.taux_conversion = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversion_rate BEFORE INSERT OR UPDATE ON public.performance_stats 
FOR EACH ROW EXECUTE FUNCTION calculate_conversion_rate();

-- Données de test
INSERT INTO public.profiles (id, email, role, first_name, last_name, phone) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@premunia.com', 'admin', 'Admin', 'Premunia', '0123456789'),
    ('550e8400-e29b-41d4-a716-446655440001', 'manager@premunia.com', 'manager', 'Marie', 'Dubois', '0123456790'),
    ('550e8400-e29b-41d4-a716-446655440002', 'commercial@premunia.com', 'commercial', 'Jean', 'Martin', '0123456791')
ON CONFLICT (id) DO NOTHING;

-- Prospects de test
INSERT INTO public.prospects (first_name, last_name, email, phone, date_naissance, budget_mensuel, etat_sante, niveau_urgence, assigned_to, source, notes) VALUES
    ('Pierre', 'Durand', 'pierre.durand@email.com', '0123456789', '15/03/1957', 120, 'bon', 'elevee', '550e8400-e29b-41d4-a716-446655440002', 'Site web', 'Intéressé par une mutuelle complète'),
    ('Marie', 'Leroy', 'marie.leroy@email.com', '0123456790', '22/08/1952', 95, 'moyen', 'moyenne', '550e8400-e29b-41d4-a716-446655440002', 'Recommandation', 'Problèmes de vue, cherche bonne couverture optique'),
    ('Jacques', 'Bernard', 'jacques.bernard@email.com', '0123456791', '10/12/1955', 150, 'excellent', 'faible', '550e8400-e29b-41d4-a716-446655440002', 'Publicité Facebook', 'Budget élevé, veut le meilleur'),
    ('Françoise', 'Petit', 'francoise.petit@email.com', '0123456792', '05/06/1950', 80, 'bon', 'elevee', '550e8400-e29b-41d4-a716-446655440002', 'Salon senior', 'Urgence pour hospitalisation prévue'),
    ('Robert', 'Moreau', 'robert.moreau@email.com', '0123456793', '18/11/1958', 110, 'fragile', 'elevee', '550e8400-e29b-41d4-a716-446655440002', 'Bouche à oreille', 'Diabète, besoins spécifiques')
ON CONFLICT (email) DO NOTHING;

-- Templates d'emails
INSERT INTO public.email_templates (nom, sujet, contenu_html, type, created_by) VALUES
    ('Bienvenue Senior Premium', 'Bienvenue chez Premunia - Votre mutuelle santé seniors', 
     '<h2>Bonjour {{first_name}},</h2><p>Bienvenue dans notre programme mutuelle santé spécialement conçu pour les seniors. Découvrez nos garanties renforcées...</p>', 
     'email_bienvenue', '550e8400-e29b-41d4-a716-446655440000'),
    ('Relance Prospect', 'Votre devis mutuelle santé vous attend', 
     '<h2>Bonjour {{first_name}},</h2><p>Votre devis personnalisé est prêt. N''hésitez pas à nous contacter pour toute question...</p>', 
     'relance_email', '550e8400-e29b-41d4-a716-446655440000'),
    ('Anniversaire Client', 'Joyeux anniversaire {{first_name}} !', 
     '<h2>Joyeux anniversaire {{first_name}} !</h2><p>En cette occasion spéciale, nous vous proposons une révision gratuite de votre contrat...</p>', 
     'anniversaire', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Scénarios d'automatisation
INSERT INTO public.automation_scenarios (nom, description, type, statut, delai_minutes, created_by) VALUES
    ('Email de bienvenue', 'Email automatique envoyé 1h après création d''un prospect', 'email_bienvenue', 'actif', 60, '550e8400-e29b-41d4-a716-446655440000'),
    ('Relance prospect', 'Email de relance envoyé 48h après premier contact sans réponse', 'relance_email', 'actif', 2880, '550e8400-e29b-41d4-a716-446655440000'),
    ('Anniversaire client', 'Email d''anniversaire envoyé automatiquement', 'anniversaire', 'actif', 0, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;

-- Objectifs commerciaux
INSERT INTO public.commercial_objectives (commercial_id, periode_type, periode_valeur, objectif_ca, objectif_prospects, objectif_conversions, objectif_rdv, created_by) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'mensuel', '2024-12', 15000.00, 50, 10, 25, '550e8400-e29b-41d4-a716-446655440000'),
    ('550e8400-e29b-41d4-a716-446655440002', 'trimestriel', '2024-Q4', 45000.00, 150, 30, 75, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (commercial_id, periode_type, periode_valeur) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
