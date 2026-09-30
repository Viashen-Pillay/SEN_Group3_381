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

CREATE TABLE User(
    userId INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,

    role user_role NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,

    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_first_name
        CHECK (char_length(trim(firstName)) > 0),

    CONSTRAINT chk_user_last_name
        CHECK (char_length(trim(lastName)) > 0),

    CONSTRAINT chk_user_email
        CHECK (char_length(trim(email)) > 0)
);

CREATE TABLE Category (
    categoryId INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    categoryName VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    isActive BOOLEAN NOT NULL DEFAULT TRUE,

    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_category_name
        CHECK (char_length(trim(categoryName)) > 0)
);

CREATE TABLE ServiceRequest(
    requestId INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    requesterId INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    assignedStaffId INTEGER,

    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    status request_status NOT NULL DEFAULT 'NEW',

    resolutionSummary TEXT,

    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    resolvedAt TIMESTAMPTZ,
    closedAt TIMESTAMPTZ,

    CONSTRAINT fk_request_requester
        FOREIGN KEY (requesterId)
        REFERENCES User(userId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_request_category
        FOREIGN KEY (categoryId)
        REFERENCES Category(categoryId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_request_assigned_staff
        FOREIGN KEY (assignedStaffId)
        REFERENCES User(userId)
        ON DELETE RESTRICT,

    CONSTRAINT chk_request_title
        CHECK (char_length(trim(title)) > 0),

    CONSTRAINT chk_request_description
        CHECK (char_length(trim(description)) > 0)
);

CREATE TABLE RequestComment(
    commentId INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    requestId INTEGER NOT NULL,
    authorId INTEGER NOT NULL,

    content TEXT NOT NULL,

    createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comment_request
        FOREIGN KEY (requestId)
        REFERENCES ServiceRequest(requestId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_comment_author
        FOREIGN KEY (authorId)
        REFERENCES User(userId)
        ON DELETE RESTRICT,

    CONSTRAINT chk_comment_content
        CHECK (char_length(trim(content)) > 0)
);

CREATE TABLE StatusHistory(
    statusHistoryId INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    requestId INTEGER NOT NULL,
    previousStatus request_status NOT NULL,
    newStatus request_status NOT NULL,

    changedBy INTEGER NOT NULL,
    changedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_history_request
        FOREIGN KEY (requestId)
        REFERENCES ServiceRequest(requestId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changedBy)
        REFERENCES User(userId)
        ON DELETE RESTRICT,

    CONSTRAINT chk_status_changed
        CHECK (previousStatus <> newStatus)
);

CREATE TABLE AssignmentHistory(
    assignmentHistoryId INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    requestId INTEGER NOT NULL,

    previousStaffId INTEGER,
    newStaffId INTEGER NOT NULL,

    changedBy INTEGER NOT NULL,

    changedAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_request
        FOREIGN KEY (requestId)
        REFERENCES ServiceRequest(requestId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_previous_staff
        FOREIGN KEY (previousStaffId)
        REFERENCES User(userId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_new_staff
        FOREIGN KEY (newStaffId)
        REFERENCES User(userId)
        ON DELETE RESTRICT,

    CONSTRAINT fk_assignment_changed_by
        FOREIGN KEY (changedBy)
        REFERENCES User(userId)
        ON DELETE RESTRICT,

    CONSTRAINT chk_assignment_changed
        CHECK (
            previousStaffId IS NULL
            OR previousStaffId <> newStaffId
        )
);

CREATE INDEX idx_service_requests_requester
ON ServiceRequest(requesterId);

CREATE INDEX idx_service_requests_category
ON ServiceRequest(categoryId);

CREATE INDEX idx_service_requests_status
ON ServiceRequest(status);

CREATE INDEX idx_service_requests_assigned_staff
ON ServiceRequest(assignedStaffId);

CREATE INDEX idx_service_requests_created_at
ON ServiceRequest(createdAt);