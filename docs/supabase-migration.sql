-- ============================================================
-- KuryenteKo — Supabase Schema Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================


-- ─── 1. TABLES ──────────────────────────────────────────────

-- ERC-approved rates synced to device on app launch
CREATE TABLE IF NOT EXISTS national_rates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month        text NOT NULL,          -- "2026-05"
  charge_type  text NOT NULL,          -- "generation" | "transmission" | etc.
  rate_kwh     numeric(10, 4) NOT NULL,
  max_rate     numeric(10, 4) NOT NULL,
  source       text NOT NULL DEFAULT 'ERC',
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Monthly FAQ synced to device on app launch
CREATE TABLE IF NOT EXISTS faqs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question     text NOT NULL,
  answer       text NOT NULL,
  category     text NOT NULL,          -- "generation" | "lifeline" | "complaint" | "general"
  month_valid  text,                   -- "2026-05" or NULL for evergreen
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Anonymous community overcharge reports (no PII stored)
CREATE TABLE IF NOT EXISTS community_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city         text NOT NULL,
  barangay     text,
  kwh_range    text NOT NULL,          -- "0-100" | "101-200" | "201-300" | "300+"
  amount_range text NOT NULL,          -- "0-2000" | "2001-4000" | "4001-6000" | "6000+"
  report_type  text NOT NULL DEFAULT 'normal', -- "overcharge" | "sub_meter" | "normal"
  created_at   timestamptz NOT NULL DEFAULT now()
);


-- ─── 2. ROW LEVEL SECURITY ──────────────────────────────────

ALTER TABLE national_rates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports  ENABLE ROW LEVEL SECURITY;

-- national_rates: anyone can read, nobody can write via API
CREATE POLICY "Public read national_rates"
  ON national_rates FOR SELECT
  TO anon, authenticated
  USING (true);

-- faqs: anyone can read, nobody can write via API
CREATE POLICY "Public read faqs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (true);

-- community_reports: anyone can read + insert (anonymous submissions)
CREATE POLICY "Public read community_reports"
  ON community_reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert community_reports"
  ON community_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- ─── 3. HEAT MAP VIEW ───────────────────────────────────────

-- Aggregated view used by the heat map screen
-- Returns average amount per city based on mid-point of amount_range
CREATE OR REPLACE VIEW city_heat_map AS
SELECT
  city,
  COUNT(*) AS report_count,
  ROUND(AVG(
    CASE amount_range
      WHEN '0-2000'    THEN 1000
      WHEN '2001-4000' THEN 3000
      WHEN '4001-6000' THEN 5000
      WHEN '6000+'     THEN 7500
    END
  ), 0) AS average_amount,
  CASE
    WHEN AVG(CASE amount_range
      WHEN '0-2000'    THEN 1000
      WHEN '2001-4000' THEN 3000
      WHEN '4001-6000' THEN 5000
      WHEN '6000+'     THEN 7500
    END) < 2500 THEN 'low'
    WHEN AVG(CASE amount_range
      WHEN '0-2000'    THEN 1000
      WHEN '2001-4000' THEN 3000
      WHEN '4001-6000' THEN 5000
      WHEN '6000+'     THEN 7500
    END) < 4500 THEN 'medium'
    ELSE 'high'
  END AS status
FROM community_reports
GROUP BY city;


-- ─── 4. SEED — ERC RATES (May 2026) ─────────────────────────

-- April 2026 rates (source: meralco.com.ph official rate schedule, ERC-cleared)
-- Overall residential rate April 2026: ₱14.3496/kWh
INSERT INTO national_rates (month, charge_type, rate_kwh, max_rate, source) VALUES
  ('2026-04', 'generation',    8.3864, 8.3864, 'ERC'),
  ('2026-04', 'transmission',  0.83,   0.95,   'ERC'),
  ('2026-04', 'system_loss',   0.78,   0.78,   'ERC'),
  ('2026-04', 'distribution',  2.76,   2.76,   'ERC'),
  ('2026-04', 'supply',        0.40,   0.45,   'ERC'),
  ('2026-04', 'metering',      0.22,   0.25,   'ERC');


-- ─── 5. SEED — FAQ (Evergreen + May 2026) ────────────────────

INSERT INTO faqs (question, answer, category, month_valid) VALUES
  (
    'Ano ang generation charge?',
    'Ito ang pinakamalaking bahagi ng iyong bill — ang bayad sa power plant na gumawa ng kuryente mo. Karaniwang 50–55% ng iyong total bill. Legal ito, pero may maximum rate ang ERC.',
    'generation', NULL
  ),
  (
    'Ano ang transmission charge?',
    'Bayad sa NGCP (National Grid Corporation) para sa pagdadala ng kuryente mula sa power plant papunta sa inyong lugar. Hindi ito kontrolado ng Meralco.',
    'transmission', NULL
  ),
  (
    'Ano ang system loss charge?',
    'Ito ang kuryenteng nawawala sa linya habang dinadala sa inyong bahay. Legal ito, PERO 8.5% lang ang maximum na pwedeng singilin sa iyo. Kung higit sa 8.5%, pwede kang magreklamo sa ERC.',
    'system_loss', NULL
  ),
  (
    'Pwede ba akong magreklamo kahit hindi pa ako bayad?',
    'Oo, pwede. Ang pagreklamo sa ERC ay karapatan mo bilang consumer kahit may natitirang bayad. Huwag hayaang pigilan ka ng utang na kuryente sa pag-file ng reklamo tungkol sa overcharging.',
    'complaint', NULL
  ),
  (
    'Sino ang may karapatang sa lifeline rate?',
    'Ang mga residential household na gumagamit ng 0–100 kWh bawat buwan, ang tinitirhan ay pangunahing tirahan, at walang ibang kuryenteng koneksyon. Kung ikaw ay qualified, may diskwento ka sa bawat kWh na ginagamit mo.',
    'lifeline', NULL
  ),
  (
    'Paano malalaman kung sub-meter abuse ang landlord ko?',
    'Hanapin ang kasalukuyang Meralco rate sa iyong area (makikita sa iyong bill o sa Meralco website). Kung ang kinukuha ng landlord mo ay mas mataas pa sa rate ng Meralco bawat kWh, sub-meter abuse na iyon. Pwede kang magreklamo sa DTI.',
    'complaint', NULL
  ),
  (
    'Bakit tumaas ang bill ko ngayong summer?',
    'Normal na tumataas ang bill sa Abril–Hunyo dahil sa El Niño at peak demand. Mas mainit ang panahon kaya mas maraming gumagamit ng aircon. Dagdag pa rito, mababa ang supply ng tubig sa mga hydroelectric power plant sa tag-tuyot, kaya mas mahal ang kuryente.',
    'general', NULL
  ),
  (
    'Ano ang Malampaya at bakit nakakaapekto sa aking bill?',
    'Ang Malampaya ay isang gas field sa Palawan na nagbibigay ng natural gas sa mga power plant. Kapag bumaba ang supply nito, kailangan pang bumili ng mas mahal na alternatibong fuel. Ang dagdag na gastos ay napupunta sa iyong generation charge.',
    'general', NULL
  ),
  (
    'Saan ako magreklamo tungkol sa mataas na bill?',
    'Para sa overcharging ng Meralco o electric coop: magreklamo sa ERC (Energy Regulatory Commission). Para sa sub-meter abuse ng landlord: magreklamo sa DTI (Department of Trade and Industry). Pwede ring direkta sa Meralco hotline: 16211.',
    'complaint', NULL
  ),
  (
    'Ano ang distribution charge?',
    'Bayad ito para sa lokal na distribution network ng Meralco — ang mga poste, kawad, at transformer sa inyong barangay na nagdadala ng kuryente papunta sa inyong bahay mula sa substation.',
    'general', NULL
  ),
  (
    'Pwede bang i-dispute ang bill ko?',
    'Oo. Makipag-ugnayan muna sa Meralco hotline (16211) para sa formal dispute. Kung hindi maayos, mag-file ng reklamo sa ERC. May karapatang kang humiling ng rebate o adjustment kung napatunayan na nag-overbill sila.',
    'complaint', NULL
  ),
  (
    'Paano mababawasan ang aking bill?',
    'Ang pinakamabisang paraan: (1) Gamitin ang inverter aircon imbes na non-inverter — nakakatipid ng hanggang 40%. (2) Palitan ang lumang ref ng energy-efficient model. (3) Gumamit ng LED bulbs. (4) I-unplug ang mga appliance kapag hindi ginagamit — may phantom load ang maraming gadget.',
    'general', NULL
  ),
  (
    'Ano ang VAT sa kuryente?',
    '12% VAT ang kinukuha ng gobyerno sa halos lahat ng singil sa iyong bill. Ito ay mandatoryo at hindi ito mababago ng Meralco. Makikita ito bilang Taxes sa iyong bill.',
    'general', NULL
  ),
  (
    'Ano ang Senior Citizen discount sa kuryente?',
    'Ang mga senior citizen na nagmamay-ari ng residential account ay may karapatang sa 5% discount sa kanilang monthly electricity bill. Pumunta sa pinakamalapit na Meralco business center na may Senior Citizen ID para mag-apply.',
    'lifeline', NULL
  ),
  (
    'Bakit mataas ang generation charge ngayong Mayo 2026?',
    'Sa Mayo 2026, ang generation charge ay nananatiling mataas dahil sa patuloy na pagbaba ng Malampaya gas supply at pagtaas ng demand pagkatapos ng El Niño season. Sinusuportahan pa rin ng mga coal plant ang karamihan ng supply, na mahal ang fuel cost ngayon.',
    'generation', '2026-05'
  );


-- ─── 6. SEED — COMMUNITY REPORTS (50 dummy entries) ──────────

INSERT INTO community_reports (city, kwh_range, amount_range, report_type) VALUES
  ('Tondo, Manila',    '201-300', '4001-6000', 'overcharge'),
  ('Tondo, Manila',    '201-300', '4001-6000', 'overcharge'),
  ('Tondo, Manila',    '101-200', '2001-4000', 'normal'),
  ('Tondo, Manila',    '201-300', '6000+',     'overcharge'),
  ('Tondo, Manila',    '101-200', '4001-6000', 'overcharge'),
  ('Caloocan',         '201-300', '4001-6000', 'overcharge'),
  ('Caloocan',         '101-200', '2001-4000', 'normal'),
  ('Caloocan',         '201-300', '4001-6000', 'overcharge'),
  ('Caloocan',         '101-200', '4001-6000', 'overcharge'),
  ('Caloocan',         '300+',    '6000+',     'overcharge'),
  ('Quezon City',      '201-300', '4001-6000', 'normal'),
  ('Quezon City',      '101-200', '2001-4000', 'normal'),
  ('Quezon City',      '201-300', '4001-6000', 'overcharge'),
  ('Quezon City',      '101-200', '2001-4000', 'normal'),
  ('Quezon City',      '300+',    '6000+',     'overcharge'),
  ('Pasig',            '101-200', '2001-4000', 'normal'),
  ('Pasig',            '201-300', '4001-6000', 'normal'),
  ('Pasig',            '101-200', '2001-4000', 'normal'),
  ('Pasig',            '201-300', '2001-4000', 'normal'),
  ('Pasig',            '101-200', '4001-6000', 'overcharge'),
  ('Makati',           '101-200', '2001-4000', 'normal'),
  ('Makati',           '101-200', '2001-4000', 'normal'),
  ('Makati',           '201-300', '4001-6000', 'normal'),
  ('Makati',           '0-100',   '0-2000',    'normal'),
  ('Makati',           '101-200', '2001-4000', 'normal'),
  ('Mandaluyong',      '101-200', '2001-4000', 'normal'),
  ('Mandaluyong',      '201-300', '4001-6000', 'overcharge'),
  ('Mandaluyong',      '101-200', '2001-4000', 'normal'),
  ('Mandaluyong',      '201-300', '4001-6000', 'overcharge'),
  ('Mandaluyong',      '101-200', '4001-6000', 'overcharge'),
  ('Marikina',         '101-200', '2001-4000', 'normal'),
  ('Marikina',         '201-300', '4001-6000', 'normal'),
  ('Marikina',         '101-200', '2001-4000', 'normal'),
  ('Marikina',         '0-100',   '0-2000',    'normal'),
  ('Marikina',         '201-300', '2001-4000', 'normal'),
  ('Valenzuela',       '201-300', '4001-6000', 'overcharge'),
  ('Valenzuela',       '300+',    '6000+',     'overcharge'),
  ('Valenzuela',       '201-300', '4001-6000', 'overcharge'),
  ('Valenzuela',       '101-200', '2001-4000', 'normal'),
  ('Valenzuela',       '201-300', '4001-6000', 'overcharge'),
  ('Las Piñas',        '101-200', '2001-4000', 'normal'),
  ('Las Piñas',        '201-300', '4001-6000', 'normal'),
  ('Las Piñas',        '101-200', '2001-4000', 'normal'),
  ('Muntinlupa',       '201-300', '4001-6000', 'normal'),
  ('Muntinlupa',       '101-200', '2001-4000', 'normal'),
  ('Parañaque',        '101-200', '2001-4000', 'normal'),
  ('Parañaque',        '201-300', '4001-6000', 'overcharge'),
  ('Malabon',          '201-300', '4001-6000', 'overcharge'),
  ('Malabon',          '300+',    '6000+',     'overcharge'),
  ('Navotas',          '201-300', '4001-6000', 'overcharge');
