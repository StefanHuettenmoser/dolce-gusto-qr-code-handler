CREATE TABLE IF NOT EXISTS code (
    code CHAR(12) NOT NULL UNIQUE,
    entered BOOLEAN DEFAULT 0,
    error BOOLEAN DEFAULT 0,
    added DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dolce_point (
    points INT DEFAULT 0,
    updated DATETIME
);

INSERT INTO dolce_point (points) VALUES (0);