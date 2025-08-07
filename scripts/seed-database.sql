-- Insert roles
INSERT INTO roles (id, name) VALUES 
  ('role_admin', 'admin'),
  ('role_secretary', 'secretaria'),
  ('role_tecnico', 'tecnico');

-- Insert services
INSERT INTO services (id, name, description, price) VALUES 
  ('service_1', 'Amestica', 'Diagnóstico de redes de agua', 80000),
  ('service_2', 'Multifugas', 'Detección de fugas con tecnología especializada', 50000),
  ('service_3', 'Semifugas', 'Revisión de fugas domiciliarias', 35000);

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, name, password, "roleId") VALUES 
  ('user_admin', 'admin@amestica.cl', 'Administrador', 'admin123', 'role_admin');

-- Insert sample clients
INSERT INTO clients (id, name, email, phone, address) VALUES 
  ('client_1', 'María Riquelme', 'paz.rimed@gmail.com', '+56985714993', 'Chillán, Ñuble'),
  ('client_2', 'Camilo Rodríguez', 'camilo@email.com', '+56987654321', 'Viña del Mar, V Región'),
  ('client_3', 'Ana Martínez', 'ana@email.com', '+56911111111', 'Rancagua, VI Región');