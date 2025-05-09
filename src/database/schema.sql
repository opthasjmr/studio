-- Users Table: Stores information about all users (admins, doctors, receptionists, patients)
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'receptionist', 'patient');

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    profile_photo_url TEXT,
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table: Stores detailed patient information
CREATE TABLE patients (
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Link to users table if patient has login
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10), -- e.g., Male, Female, Other
    phone_number VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table: Stores doctor-specific information (extends users table)
CREATE TABLE doctors (
    doctor_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    -- availability_schedule JSONB, -- Example: {"monday": ["09:00-12:00", "14:00-17:00"], ...}
    avg_consultation_time_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Availability Table: More structured way to handle availability
CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

CREATE TABLE doctor_availability (
    availability_id SERIAL PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    day_of_week day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    CONSTRAINT unique_doctor_day_time UNIQUE (doctor_id, day_of_week, start_time, end_time)
);

-- Doctor Leave Table: To block out specific dates
CREATE TABLE doctor_leave (
    leave_id SERIAL PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    start_date_time TIMESTAMPTZ NOT NULL,
    end_date_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Appointments Table: Manages appointment scheduling
CREATE TYPE appointment_status AS ENUM ('Booked', 'Confirmed', 'Completed', 'Canceled', 'No-Show', 'Arrived', 'Pending Confirmation');
CREATE TYPE appointment_type AS ENUM ('New', 'Follow-up', 'Teleconsultation', 'Walk-in', 'Procedure');

CREATE TABLE appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    scheduled_by_user_id UUID REFERENCES users(user_id), -- Receptionist or Admin who booked
    appointment_start_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type appointment_type,
    reason_for_visit TEXT,
    status appointment_status DEFAULT 'Pending Confirmation',
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    teleconsult_join_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- EMR (Electronic Medical Records) Table
CREATE TABLE emr (
    emr_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    ocular_history JSONB, -- Can store structured data: e.g., {"refraction_od": "...", "iop_os": "..."}
    medical_history JSONB,
    allergies JSONB,
    current_medications JSONB, -- Array of objects: [{"name": "Aspirin", "dosage": "81mg", "frequency": "daily"}]
    diagnosis_codes JSONB, -- Array of ICD-10 codes or similar
    treatment_plan TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emr_id UUID NOT NULL REFERENCES emr(emr_id) ON DELETE CASCADE,
    -- OR link directly to patient and doctor if EMR is not always created first
    -- patient_id UUID NOT NULL REFERENCES patients(patient_id),
    -- doctor_id UUID NOT NULL REFERENCES doctors(doctor_id),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity VARCHAR(50),
    refills_allowed INTEGER DEFAULT 0,
    instructions TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Diagnostic Images Table
CREATE TYPE image_scan_type AS ENUM ('OCT', 'Fundus', 'Slit Lamp', 'X-Ray', 'MRI', 'Other');

CREATE TABLE diagnostic_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emr_id UUID REFERENCES emr(emr_id) ON DELETE CASCADE, -- Or patient_id directly
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    image_type image_scan_type,
    image_url TEXT NOT NULL, -- URL to image stored in cloud storage (S3, Firebase Storage)
    ai_analysis_report_url TEXT, -- Link to AI analysis result if separate
    upload_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Billing Invoices Table
CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Pending', 'Paid', 'Partially Paid', 'Overdue', 'Void');

CREATE TABLE billing_invoices (
    invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0.00,
    payment_due_date DATE,
    status invoice_status DEFAULT 'Pending',
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items Table: Line items for each invoice
CREATE TABLE invoice_items (
    invoice_item_id SERIAL PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES billing_invoices(invoice_id) ON DELETE CASCADE,
    service_description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Payments Table
CREATE TYPE payment_method AS ENUM ('Card', 'Cash', 'UPI', 'Bank Transfer', 'Insurance', 'Other');

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES billing_invoices(invoice_id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    payment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_method payment_method,
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insurance Claims Table
CREATE TYPE claim_status AS ENUM ('Pending', 'Submitted', 'Approved', 'Rejected', 'Resubmitted', 'Paid');

CREATE TABLE insurance_claims (
    claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES billing_invoices(invoice_id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    insurance_provider_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    claim_amount NUMERIC(10, 2) NOT NULL,
    status claim_status DEFAULT 'Pending',
    submission_date DATE,
    resolution_date DATE,
    tpa_reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log Table: For recent activity feeds and audit trails
CREATE TABLE activity_log (
    log_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- User who performed the action
    action_type VARCHAR(100) NOT NULL, -- e.g., 'EMR_UPDATE', 'APPOINTMENT_CREATE', 'PATIENT_LOGIN'
    description TEXT,
    target_entity_type VARCHAR(50), -- e.g., 'Patient', 'Appointment'
    target_entity_id UUID,
    details JSONB, -- Additional details about the action
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Patient Tags Lookup Table: Predefined tags for conditions, alerts etc.
CREATE TABLE patient_tags_lookup (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE NOT NULL,
    tag_category VARCHAR(50), -- e.g., 'Condition', 'Alert', 'Follow-up'
    description TEXT
);

-- Patient Tags Junction Table: Many-to-many relationship between patients and tags
CREATE TABLE patient_tags_junction (
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES patient_tags_lookup(tag_id) ON DELETE CASCADE,
    assigned_by_user_id UUID REFERENCES users(user_id),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (patient_id, tag_id)
);

-- System Settings Table: For admin-configurable settings
CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    description TEXT,
    data_type VARCHAR(50) DEFAULT 'string', -- e.g., string, boolean, number, json
    is_editable_by_admin BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TYPE notification_type AS ENUM ('APPOINTMENT_REMINDER', 'APPOINTMENT_UPDATE', 'NEW_MESSAGE', 'BILLING_ALERT', 'SYSTEM_ALERT', 'EMR_UPDATE', 'TEST_RESULT_READY');

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Recipient
    message TEXT NOT NULL,
    type notification_type,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    link_to TEXT, -- e.g., /appointments/uuid or /patients/uuid/emr/uuid
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Consent Forms Table
CREATE TABLE consent_forms (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    form_type VARCHAR(100) NOT NULL, -- e.g., 'General Consent', 'Telemedicine Consent', 'Procedure Consent'
    consent_document_url TEXT NOT NULL, -- Link to stored PDF/image
    signed_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    witness_name VARCHAR(255),
    created_by_user_id UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_start_time ON appointments(appointment_start_time);
CREATE INDEX idx_emr_patient_id ON emr(patient_id);
CREATE INDEX idx_emr_appointment_id ON emr(appointment_id);
CREATE INDEX idx_prescriptions_emr_id ON prescriptions(emr_id);
CREATE INDEX idx_billing_invoices_patient_id ON billing_invoices(patient_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_insurance_claims_patient_id ON insurance_claims(patient_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);


-- Functions to update `updated_at` columns automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with `updated_at`
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_patients
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_doctors
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_emr
BEFORE UPDATE ON emr
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_prescriptions
BEFORE UPDATE ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_billing_invoices
BEFORE UPDATE ON billing_invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_insurance_claims
BEFORE UPDATE ON insurance_claims
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_system_settings
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
