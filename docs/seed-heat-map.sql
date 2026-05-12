-- ============================================================
-- KuryenteKo — Heat Map Seed Data
-- Run in Supabase SQL Editor > New Query
-- City names must EXACTLY match CITY_COORDS keys in heat-map.tsx
-- ============================================================

INSERT INTO community_reports (city, kwh_range, amount_range, report_type) VALUES

-- Manila (high bills — dense urban)
('Manila', '201-300', '4001-6000', 'overcharge'),
('Manila', '201-300', '6000+',     'overcharge'),
('Manila', '101-200', '4001-6000', 'overcharge'),
('Manila', '301-400', '6000+',     'overcharge'),
('Manila', '201-300', '4001-6000', 'normal'),
('Manila', '101-200', '2001-4000', 'normal'),

-- Quezon City (mixed)
('Quezon City', '201-300', '4001-6000', 'overcharge'),
('Quezon City', '101-200', '2001-4000', 'normal'),
('Quezon City', '201-300', '4001-6000', 'normal'),
('Quezon City', '101-200', '2001-4000', 'normal'),
('Quezon City', '301-400', '6000+',     'overcharge'),
('Quezon City', '0-100',   '0-2000',    'normal'),
('Quezon City', '101-200', '2001-4000', 'normal'),

-- Makati (mostly normal — newer buildings, more efficient)
('Makati', '101-200', '2001-4000', 'normal'),
('Makati', '0-100',   '0-2000',    'normal'),
('Makati', '101-200', '2001-4000', 'normal'),
('Makati', '201-300', '4001-6000', 'normal'),
('Makati', '0-100',   '0-2000',    'normal'),
('Makati', '101-200', '2001-4000', 'normal'),

-- Pasig (medium)
('Pasig', '101-200', '2001-4000', 'normal'),
('Pasig', '201-300', '4001-6000', 'normal'),
('Pasig', '101-200', '2001-4000', 'normal'),
('Pasig', '201-300', '2001-4000', 'normal'),
('Pasig', '101-200', '4001-6000', 'overcharge'),
('Pasig', '201-300', '4001-6000', 'overcharge'),

-- Taguig (medium — BGC area pulls averages down)
('Taguig', '101-200', '2001-4000', 'normal'),
('Taguig', '201-300', '4001-6000', 'normal'),
('Taguig', '0-100',   '0-2000',    'normal'),
('Taguig', '101-200', '2001-4000', 'normal'),
('Taguig', '201-300', '4001-6000', 'overcharge'),

-- Mandaluyong (medium-high)
('Mandaluyong', '101-200', '2001-4000', 'normal'),
('Mandaluyong', '201-300', '4001-6000', 'overcharge'),
('Mandaluyong', '101-200', '4001-6000', 'overcharge'),
('Mandaluyong', '201-300', '4001-6000', 'overcharge'),
('Mandaluyong', '101-200', '2001-4000', 'normal'),

-- Marikina (low-medium — greener area)
('Marikina', '101-200', '2001-4000', 'normal'),
('Marikina', '0-100',   '0-2000',    'normal'),
('Marikina', '101-200', '2001-4000', 'normal'),
('Marikina', '201-300', '2001-4000', 'normal'),
('Marikina', '0-100',   '2001-4000', 'normal'),

-- Caloocan (high — older infrastructure)
('Caloocan', '201-300', '4001-6000', 'overcharge'),
('Caloocan', '301-400', '6000+',     'overcharge'),
('Caloocan', '201-300', '6000+',     'overcharge'),
('Caloocan', '101-200', '4001-6000', 'overcharge'),
('Caloocan', '201-300', '4001-6000', 'overcharge'),
('Caloocan', '101-200', '2001-4000', 'normal'),

-- Malabon (high)
('Malabon', '201-300', '4001-6000', 'overcharge'),
('Malabon', '301-400', '6000+',     'overcharge'),
('Malabon', '201-300', '6000+',     'overcharge'),
('Malabon', '101-200', '4001-6000', 'overcharge'),
('Malabon', '201-300', '4001-6000', 'overcharge'),

-- Navotas (high)
('Navotas', '201-300', '4001-6000', 'overcharge'),
('Navotas', '301-400', '6000+',     'overcharge'),
('Navotas', '201-300', '4001-6000', 'overcharge'),
('Navotas', '101-200', '4001-6000', 'overcharge'),

-- Valenzuela (high)
('Valenzuela', '201-300', '4001-6000', 'overcharge'),
('Valenzuela', '301-400', '6000+',     'overcharge'),
('Valenzuela', '201-300', '4001-6000', 'overcharge'),
('Valenzuela', '201-300', '4001-6000', 'overcharge'),
('Valenzuela', '101-200', '2001-4000', 'normal'),

-- Las Piñas (medium)
('Las Piñas', '101-200', '2001-4000', 'normal'),
('Las Piñas', '201-300', '4001-6000', 'normal'),
('Las Piñas', '101-200', '2001-4000', 'normal'),
('Las Piñas', '201-300', '2001-4000', 'normal'),
('Las Piñas', '0-100',   '0-2000',    'normal'),

-- Muntinlupa (medium)
('Muntinlupa', '201-300', '4001-6000', 'normal'),
('Muntinlupa', '101-200', '2001-4000', 'normal'),
('Muntinlupa', '201-300', '2001-4000', 'normal'),
('Muntinlupa', '101-200', '2001-4000', 'normal'),
('Muntinlupa', '201-300', '4001-6000', 'overcharge'),

-- Parañaque (medium)
('Parañaque', '101-200', '2001-4000', 'normal'),
('Parañaque', '201-300', '4001-6000', 'overcharge'),
('Parañaque', '101-200', '2001-4000', 'normal'),
('Parañaque', '201-300', '4001-6000', 'normal'),
('Parañaque', '0-100',   '0-2000',    'normal'),

-- Pasay (medium-high)
('Pasay', '201-300', '4001-6000', 'overcharge'),
('Pasay', '101-200', '2001-4000', 'normal'),
('Pasay', '201-300', '4001-6000', 'overcharge'),
('Pasay', '101-200', '4001-6000', 'overcharge'),
('Pasay', '201-300', '4001-6000', 'normal'),

-- San Juan (medium)
('San Juan', '101-200', '2001-4000', 'normal'),
('San Juan', '201-300', '4001-6000', 'normal'),
('San Juan', '101-200', '2001-4000', 'normal'),
('San Juan', '201-300', '2001-4000', 'normal'),

-- Bacoor (medium — Cavite)
('Bacoor', '101-200', '2001-4000', 'normal'),
('Bacoor', '201-300', '4001-6000', 'normal'),
('Bacoor', '101-200', '2001-4000', 'normal'),
('Bacoor', '0-100',   '0-2000',    'normal'),
('Bacoor', '201-300', '4001-6000', 'overcharge'),

-- Imus (low-medium)
('Imus', '101-200', '2001-4000', 'normal'),
('Imus', '0-100',   '0-2000',    'normal'),
('Imus', '101-200', '2001-4000', 'normal'),
('Imus', '201-300', '2001-4000', 'normal'),

-- Dasmariñas (low-medium)
('Dasmariñas', '101-200', '0-2000',    'normal'),
('Dasmariñas', '0-100',   '0-2000',    'normal'),
('Dasmariñas', '101-200', '2001-4000', 'normal'),
('Dasmariñas', '201-300', '2001-4000', 'normal'),

-- Antipolo (medium — Rizal)
('Antipolo', '101-200', '2001-4000', 'normal'),
('Antipolo', '201-300', '4001-6000', 'normal'),
('Antipolo', '101-200', '2001-4000', 'normal'),
('Antipolo', '201-300', '4001-6000', 'overcharge'),
('Antipolo', '101-200', '2001-4000', 'normal'),

-- Biñan (low — Laguna)
('Biñan', '101-200', '2001-4000', 'normal'),
('Biñan', '0-100',   '0-2000',    'normal'),
('Biñan', '101-200', '0-2000',    'normal'),
('Biñan', '201-300', '2001-4000', 'normal'),

-- Santa Rosa (low — Laguna, industrial/commercial)
('Santa Rosa', '101-200', '2001-4000', 'normal'),
('Santa Rosa', '0-100',   '0-2000',    'normal'),
('Santa Rosa', '101-200', '0-2000',    'normal'),
('Santa Rosa', '0-100',   '0-2000',    'normal'),

-- Meycauayan (medium — Bulacan)
('Meycauayan', '201-300', '4001-6000', 'overcharge'),
('Meycauayan', '101-200', '2001-4000', 'normal'),
('Meycauayan', '201-300', '4001-6000', 'normal'),
('Meycauayan', '101-200', '2001-4000', 'normal');
