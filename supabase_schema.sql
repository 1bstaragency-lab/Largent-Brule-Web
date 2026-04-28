-- CREATE EARLY ACCESS TABLE
CREATE TABLE early_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE early_access ENABLE ROW LEVEL SECURITY;

-- ALLOW ANONYMOUS INSERTS
CREATE POLICY "Allow anonymous inserts" ON early_access
  FOR INSERT 
  WITH CHECK (true);
