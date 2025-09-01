-- Add new columns to Ingreso table
ALTER TABLE Ingreso 
ADD actualizadoPor INT,
    activo BIT DEFAULT 1;

-- Add foreign key constraint for actualizadoPor in Ingreso table
ALTER TABLE Ingreso
ADD CONSTRAINT FK__Ingreso__actualizadoPor__72C60C4A 
FOREIGN KEY (actualizadoPor) REFERENCES Usuario(idUsuario);

-- Add new columns to Egreso table
ALTER TABLE Egreso 
ADD actualizadoPor INT,
    activo BIT DEFAULT 1;

-- Add foreign key constraint for actualizadoPor in Egreso table
ALTER TABLE Egreso
ADD CONSTRAINT FK__Egreso__actualizadoPor__75A278F5 
FOREIGN KEY (actualizadoPor) REFERENCES Usuario(idUsuario);

-- Update existing records to set activo = 1 (true)
UPDATE Ingreso SET activo = 1 WHERE activo IS NULL;
UPDATE Egreso SET activo = 1 WHERE activo IS NULL;