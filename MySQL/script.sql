CREATE DATABASE ENERGYCARS;

USE ENERGYCARS;

-- Table: PROVINCIAS
CREATE TABLE PROVINCIAS (
    ID_PROVINCIA INT AUTO_INCREMENT PRIMARY KEY,
    PROVINCIA_NOMBRE VARCHAR(50) NOT NULL,
    PROVINCIA_DESCRIP VARCHAR(100)
);

-- Table: ESTACIONES_CARGA
CREATE TABLE ESTACIONES_CARGA (
    ID_ESTC INT AUTO_INCREMENT PRIMARY KEY,
    ESTC_NOMBRE VARCHAR(50) NOT NULL,
    ESTC_DIRECCION VARCHAR(80) NOT NULL,
    ESTC_LOCALIDAD VARCHAR(80) NOT NULL,
    ID_PROVINCIA INT NOT NULL,
    ESTC_CANT_SURTIDORES TINYINT NOT NULL,
    ESTC_LATITUD DECIMAL(11,8),
    ESTC_LONGITUD DECIMAL(11,8)
    FOREIGN KEY (ID_PROVINCIA) REFERENCES PROVINCIAS(ID_PROVINCIA)
);

-- Table: TIPOS_CONECTORES
CREATE TABLE TIPOS_CONECTORES (
    ID_TC INT AUTO_INCREMENT PRIMARY KEY,
    TC_NOMBRE VARCHAR(50) NOT NULL,
    TC_DESCRIP VARCHAR(100)
);

-- Table: MARCAS
CREATE TABLE MARCAS (
    ID_MARCA INT AUTO_INCREMENT PRIMARY KEY,
    MARC_NOMBRE VARCHAR(30) NOT NULL
);

-- Table: MODELOS
CREATE TABLE MODELOS (
    ID_MODELO INT AUTO_INCREMENT PRIMARY KEY,
    MOD_NOMBRE VARCHAR(30) NOT NULL
);

-- Table: ANIO
CREATE TABLE ANIO (
    ID_ANIO INT AUTO_INCREMENT PRIMARY KEY,
    ANIO INT NOT NULL
);

-- Table: MARCA_MODELO
CREATE TABLE MARCA_MODELO (
    ID_MARCA_MODELO INT AUTO_INCREMENT PRIMARY KEY,
    ID_MARCA INT NOT NULL,
    ID_MODELO INT NOT NULL,
    ID_TC INT NOT NULL,
    FOREIGN KEY (ID_MARCA) REFERENCES MARCAS(ID_MARCA),
    FOREIGN KEY (ID_MODELO) REFERENCES MODELOS(ID_MODELO),
    FOREIGN KEY (ID_TC) REFERENCES TIPOS_CONECTORES(ID_TC)
);

-- Table: VEHICULOS
CREATE TABLE VEHICULOS (
    ID_VEHICULO INT AUTO_INCREMENT PRIMARY KEY,
    ID_MARCA_MODELO INT NOT NULL,
    ID_ANIO INT NOT NULL,
    VEH_PATENTE VARCHAR(10) NOT NULL,
    ID_USER INT NOT NULL,
    FOREIGN KEY (ID_ANIO) REFERENCES ANIO(ID_ANIO),
    FOREIGN KEY (ID_MARCA_MODELO) REFERENCES MARCA_MODELO(ID_MARCA_MODELO),
    FOREIGN KEY (ID_USER) REFERENCES USUARIO(ID_USER)
);

-- Table: USUARIO
CREATE TABLE USUARIO (
    ID_USER INT AUTO_INCREMENT PRIMARY KEY,
    USER_NOMBRE VARCHAR(50) NOT NULL,
    USER_APELLIDO VARCHAR(50) NOT NULL,
    USER_CORREO NVARCHAR(50) NOT NULL,
    USER_CONTRASEÑA VARCHAR(300) NOT NULL,
    USER_TELEFONO VARCHAR(25) NOT NULL,
    USER_FECHA_REGISTRO timestamp NOT null default current_timestamp
);

-- Table: ESTADO_RESERVAS
CREATE TABLE ESTADO_RESERVAS (
    ID_EST_RES INT AUTO_INCREMENT PRIMARY KEY,
    EST_RES_DESCRIP VARCHAR(10) NOT NULL
);

-- Table: RESERVAS
CREATE TABLE RESERVAS (
    ID_RESERVA INT AUTO_INCREMENT PRIMARY KEY,
    RESERVA_FECHA VARCHAR(10) NOT NULL,
    RESERVA_HORA_INI VARCHAR(5) NOT NULL,
    RESERVA_HORA_FIN VARCHAR(5) NOT NULL,
    RESERVA_IMPORTE VARCHAR(10) NOT NULL,
    ID_USER INT NOT NULL,
    ID_EST_RES INT NOT NULL,
    ID_SURTIDOR INT NOT NULL,
    FOREIGN KEY (ID_USER) REFERENCES USUARIO(ID_USER),
    FOREIGN KEY (ID_EST_RES) REFERENCES ESTADO_RESERVAS(ID_EST_RES),
    FOREIGN KEY (ID_SURTIDOR) REFERENCES SURTIDORES(ID_SURTIDOR)
);

-- Table: TIEMPO_CARGA
CREATE TABLE TIEMPO_CARGA (
    ID_TIEMPO_CARGA INT AUTO_INCREMENT PRIMARY KEY,
    TIEMPO_CARGA INT NOT NULL,
    ID_MEDIDA INT NOT NULL,
    FOREIGN KEY (ID_MEDIDA) REFERENCES MEDIDA(ID_MEDIDA)
);

-- Table: SURTIDORES
CREATE TABLE SURTIDORES (
    ID_SURTIDOR INT AUTO_INCREMENT PRIMARY KEY,
    SURT_ESTADO tinyint(1) NOT NULL,
    ID_ESTC INT NOT NULL,
    FOREIGN KEY (ID_ESTC) REFERENCES ESTACIONES_CARGA(ID_ESTC)
);

-- Table: PRECIOS
CREATE TABLE PRECIOS (
    ID_PRECIO INT AUTO_INCREMENT PRIMARY KEY,
    PRECIO_DESCRIP VARCHAR(20) NOT NULL,
    PRECIO_TIEMPO DECIMAL NOT NULL,
    PRECIO_KW DECIMAL NOT NULL,
    ID_TIEMPO_CARGA INT NOT NULL,
    ID_ESTC INT NOT NULL,
    FOREIGN KEY (ID_TIEMPO_CARGA) REFERENCES TIEMPO_CARGA(ID_TIEMPO_CARGA),
    FOREIGN KEY (ID_ESTC) REFERENCES ESTACIONES_CARGA(ID_ESTC)
);

-- Table: MEDIDA
CREATE TABLE MEDIDA (
    ID_MEDIDA INT AUTO_INCREMENT PRIMARY KEY,
    MEDIDA_DESCRIPCION VARCHAR(50)
);
