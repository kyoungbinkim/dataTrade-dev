-- database 생성
DROP DATABASE IF EXISTS trade_db;
CREATE DATABASE trade_db;

USE trade_db;

-- table 생성
DROP TABLE IF EXISTS user;
CREATE TABLE user (
    user_idx int(11) unsigned NOT NULL AUTO_INCREMENT,
    id varchar(32) NOT NULL,
    pw varchar(64) NOT NULL,
    nickname varchar(32) NOT NULL,
    pk_own varchar(64) NOT NULL,
    pk_enc varchar(64) NOT NULL,
    ENA varchar(64) NOT NULL,
    PRIMARY KEY (user_idx),
    UNIQUE (id)
);

DROP TABLE IF EXISTS book;
CREATE TABLE book (
    data_idx int(11) unsigned NOT NULL AUTO_INCREMENT,
    user_id varchar(32) NOT NULL,
    title varchar(30) NOT NULL,
    descript text(1000),
    h_data varchar(64) NOT NULL,
    enc_key varchar(64) NOT NULL,
    enc_data_path varchar(255) NOT NULL,
    UNIQUE(h_data),
    PRIMARY KEY (data_idx),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE Cascade
);


-- default data 추가
-- DECLARE @DefaultID varchar(30);

-- INSERT INTO user (id, pw) VALUES (@DefaultID, @DefaultID);


-- 계정 권한 추가
USE mysql;
create user IF NOT EXISTS 'dataTradeServer'@'localhost' identified by 'Itsp7501`';
FLUSH privileges;

GRANT ALL privileges ON `trade_db`.* TO 'dataTradeServer'@'localhost';
