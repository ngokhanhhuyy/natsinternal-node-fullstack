-- Active: 1731222437356@@127.0.0.1@3306@natsinternal_node
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36),
    user_name VARCHAR(20) NOT NULL,
    password_hash CHAR(60) NOT NULL,
    created_datetime DATETIME NOT NULL,
    deleted_datetime DATETIME,
    row_version BIGINT DEFAULT 1,
    CONSTRAINT PK__users__id PRIMARY KEY (Id),
    CONSTRAINT UNIQUE__users__user_name UNIQUE (user_name)
);

CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36),
    name VARCHAR(15) NOT NULL,
    display_name VARCHAR(25) NOT NULL,
    power_level TINYINT UNSIGNED NOT NULL,
    row_version BIGINT,
    CONSTRAINT PK__roles__id PRIMARY KEY (Id),
    CONSTRAINT UNIQUE__roles__name UNIQUE (Name)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id CHAR(36),
    role_id CHAR(36),
    CONSTRAINT PK__user_roles__user_id__role_id PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK__user_roles__users__user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK__user_roles__roles__role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permissions (
    id CHAR(36),
    name VARCHAR(100) NOT NULL,
    role_id CHAR(36) NOT NULL,
    CONSTRAINT PK__permissions__id PRIMARY KEY (Id),
    CONSTRAINT FK__permissions__roles__role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT UNIQUE__permissions__name__role_id UNIQUE (name, role_id)
);