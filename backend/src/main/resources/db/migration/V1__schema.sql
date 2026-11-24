CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    avatar_url VARCHAR(255),
    rol_id BIGINT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE ligas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    pais VARCHAR(80) NOT NULL
);

CREATE TABLE partidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    liga_id BIGINT NOT NULL,
    equipo_local VARCHAR(100) NOT NULL,
    equipo_visitante VARCHAR(100) NOT NULL,
    logo_local VARCHAR(255),
    logo_visitante VARCHAR(255),
    fecha_partido DATETIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_partido_liga FOREIGN KEY (liga_id) REFERENCES ligas(id)
);

CREATE TABLE pronosticos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partido_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    ganador_previsto VARCHAR(100) NOT NULL,
    probabilidad INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pronostico_partido FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_pronostico_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE quinielas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nombre_jornada VARCHAR(100) NOT NULL,
    puntos_totales INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiniela_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla pivote N:M (Una quiniela tiene muchos partidos y un partido está en muchas quinielas)
CREATE TABLE quiniela_partidos (
    quiniela_id BIGINT NOT NULL,
    partido_id BIGINT NOT NULL,
    seleccion VARCHAR(20) NOT NULL, -- LOCAL, EMPATE, VISITA
    PRIMARY KEY (quiniela_id, partido_id),
    CONSTRAINT fk_qp_quiniela FOREIGN KEY (quiniela_id) REFERENCES quinielas(id) ON DELETE CASCADE,
    CONSTRAINT fk_qp_partido FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE
);

-- Para invalidar tokens JWT en el Logout
CREATE TABLE tokens_invalidados (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    fecha_expiracion DATETIME NOT NULL
);

-- Datos base de roles
INSERT INTO roles (nombre) VALUES ('ROLE_ADMIN'), ('ROLE_ANALISTA'), ('ROLE_USUARIO');