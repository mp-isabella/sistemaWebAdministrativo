-- Add cash transactions table
CREATE TABLE IF NOT EXISTS cash_transactions (
    id TEXT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    reference TEXT,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id TEXT NOT NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

-- Add invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    date TIMESTAMP NOT NULL,
    due_date TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_id TEXT NOT NULL,
    created_by_id TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

-- Add invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    invoice_id TEXT NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cash_transactions_type ON cash_transactions(type);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(date);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_created_by ON cash_transactions(created_by_id);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by_id);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Insert sample cash transactions
INSERT INTO cash_transactions (id, amount, type, description, category, payment_method, date, created_by_id)
SELECT 
    'cash_' || generate_random_uuid(),
    CASE 
        WHEN random() > 0.6 THEN (random() * 500000 + 50000)::DECIMAL(10,2)
        ELSE (random() * 100000 + 10000)::DECIMAL(10,2)
    END,
    CASE WHEN random() > 0.7 THEN 'INCOME' ELSE 'EXPENSE' END,
    CASE 
        WHEN random() > 0.5 THEN 'Pago por servicios de plomería'
        ELSE 'Compra de materiales'
    END,
    CASE 
        WHEN random() > 0.5 THEN 'Servicios de plomería'
        ELSE 'Materiales'
    END,
    CASE 
        WHEN random() > 0.6 THEN 'Transferencia bancaria'
        WHEN random() > 0.3 THEN 'Efectivo'
        ELSE 'Tarjeta de débito'
    END,
    CURRENT_TIMESTAMP - (random() * INTERVAL '30 days'),
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)
FROM generate_series(1, 20)
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');

-- Insert sample invoices
INSERT INTO invoices (id, invoice_number, date, subtotal, tax, total, client_id, created_by_id)
SELECT 
    'inv_' || generate_random_uuid(),
    'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0'),
    CURRENT_TIMESTAMP - (random() * INTERVAL '60 days'),
    (random() * 400000 + 100000)::DECIMAL(10,2),
    ((random() * 400000 + 100000) * 0.19)::DECIMAL(10,2),
    ((random() * 400000 + 100000) * 1.19)::DECIMAL(10,2),
    c.id,
    (SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1)
FROM clients c
CROSS JOIN generate_series(1, 2)
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN')
LIMIT 10;

-- Insert sample invoice items
INSERT INTO invoice_items (id, description, quantity, unit_price, total, invoice_id)
SELECT 
    'item_' || generate_random_uuid(),
    CASE 
        WHEN random() > 0.7 THEN 'Detección de fuga con equipo especializado'
        WHEN random() > 0.4 THEN 'Reparación de cañería principal'
        ELSE 'Mantención preventiva sistema completo'
    END,
    (random() * 5 + 1)::INTEGER,
    (random() * 50000 + 10000)::DECIMAL(10,2),
    ((random() * 5 + 1) * (random() * 50000 + 10000))::DECIMAL(10,2),
    i.id
FROM invoices i
CROSS JOIN generate_series(1, 3)
LIMIT 30;
