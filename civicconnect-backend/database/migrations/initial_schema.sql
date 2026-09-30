CREATE TYPE user_role AS ENUM (
    'REQUESTER',
    'STAFF',
    'MANAGEMENT'
);

CREATE TYPE request_status AS ENUM (
    'NEW',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);

CREATE TABLE users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_first_name
        CHECK (char_length(trim(first_name)) > 0),

    CONSTRAINT chk_user_last_name
        CHECK (char_length(trim(last_name)) > 0),

    CONSTRAINT chk_user_email
        CHECK (char_length(trim(email)) > 0)
);

CREATE TABLE categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_category_name
        CHECK (char_length(trim(category_name)) > 0)
);

CREATE TABLE service_requests (
    request_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    requester_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    assigned_staff_id INTEGER,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    status request_status NOT NULL DEFAULT 'NEW',

    resolution_summary TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,

    CONSTRAINT fk_request_requester
        FOREIGN KEY (requester_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_request_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_request_assigned_staff
        FOREIGN KEY (assigned_staff_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_request_title
        CHECK (char_length(trim(title)) > 0),

    CONSTRAINT chk_request_description
        CHECK (char_length(trim(description)) > 0)
);

CREATE TABLE request_comments (
    comment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    request_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_request
        FOREIGN KEY (request_id)
        REFERENCES service_requests(request_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_comment_author
        FOREIGN KEY (author_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_comment_content
        CHECK (char_length(trim(content)) > 0)
);

CREATE TABLE status_history (
    status_history_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    request_id INTEGER NOT NULL,
    previous_status request_status NOT NULL,
    new_status request_status NOT NULL,

    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_history_request
        FOREIGN KEY (request_id)
        REFERENCES service_requests(request_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_status_changed
        CHECK (previous_status <> new_status)
);

CREATE TABLE assignment_history (
    assignment_history_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    request_id INTEGER NOT NULL,

    previous_staff_id INTEGER,
    new_staff_id INTEGER NOT NULL,

    changed_by INTEGER NOT NULL,

    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_request
        FOREIGN KEY (request_id)
        REFERENCES service_requests(request_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_previous_staff
        FOREIGN KEY (previous_staff_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_new_staff
        FOREIGN KEY (new_staff_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_changed_by
        FOREIGN KEY (changed_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_assignment_changed
        CHECK (
            previous_staff_id IS NULL
            OR previous_staff_id <> new_staff_id
        )
);

CREATE INDEX idx_service_requests_requester
ON service_requests(requester_id);

CREATE INDEX idx_service_requests_category
ON service_requests(category_id);

CREATE INDEX idx_service_requests_status
ON service_requests(status);

CREATE INDEX idx_service_requests_assigned_staff
ON service_requests(assigned_staff_id);

CREATE INDEX idx_service_requests_created_at
ON service_requests(created_at);