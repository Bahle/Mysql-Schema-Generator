CREATE DATABASE IF NOT EXISTS leselihub; 
USE leselihub;

CREATE TABLE IF NOT EXISTS shareholder (
	shareholder_id INT NOT NULL AUTO_INCREMENT,
	surname VARCHAR (80) NOT NULL,
	firstname VARCHAR (80) NOT NULL,
	gender SET('MALE','FEMALE') NOT NULL,
	id_no VARCHAR (30) NOT NULL,
	ls_citizen BOOLEAN NOT NULL,
	country_of_origin SET('LESOTHO','OTHER') NOT NULL,
	disabled BOOLEAN NOT NULL,
	unemployed BOOLEAN NOT NULL,
	living_in_rural_areas BOOLEAN NOT NULL,
	youth BOOLEAN NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (shareholder_id)
);

CREATE TABLE IF NOT EXISTS contact_details (
	contact_details_id INT NOT NULL AUTO_INCREMENT,
	email VARCHAR (512) NOT NULL,
	cell_no VARCHAR (40) NOT NULL,
	work_no VARCHAR (40) NOT NULL,
	home_no VARCHAR (40) NOT NULL,
	residential_address TEXT NOT NULL,
	city VARCHAR (255) NOT NULL,
	postal_address VARCHAR (100) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (contact_details_id)
);

CREATE TABLE IF NOT EXISTS company_details (
	company_details_id INT NOT NULL AUTO_INCREMENT,
	name_of_entity VARCHAR (255) NOT NULL,
	registration_number VARCHAR (150) NOT NULL,
	physical_address TEXT NOT NULL,
	tel_no VARCHAR (40) NOT NULL,
	email VARCHAR (512) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (company_details_id)
);

CREATE TABLE IF NOT EXISTS representative (
	representative_id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR (80) NOT NULL,
	surname VARCHAR (80) NOT NULL,
	id_number VARCHAR (40) NOT NULL,
	physical_address TEXT NOT NULL,
	postal_address VARCHAR (100) NOT NULL,
	tel_no VARCHAR (40) NOT NULL,
	email VARCHAR (512) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (representative_id)
);

CREATE TABLE IF NOT EXISTS parent_details (
	parent_details_id INT NOT NULL AUTO_INCREMENT,
	capacity SET('BIRTH PARENT OF MINOR','LEGAL GUARDIAN') NOT NULL,
	surname VARCHAR (40) NOT NULL,
	firstname VARCHAR (40) NOT NULL,
	id_no VARCHAR (40) NOT NULL,
	cell_no VARCHAR (40) NOT NULL,
	work_no VARCHAR (40) NOT NULL,
	home_no VARCHAR (40) NOT NULL,
	email VARCHAR (512) NOT NULL,
	residential_address TEXT NOT NULL,
	city VARCHAR (100) NOT NULL,
	postal_code VARCHAR (100) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (parent_details_id)
);

CREATE TABLE IF NOT EXISTS bank_details (
	bank_details_id INT NOT NULL AUTO_INCREMENT,
	bank_name VARCHAR (150) NOT NULL,
	account_no VARCHAR (50) NOT NULL,
	branch_code VARCHAR (50) NOT NULL,
	account_type SET('CHEQUE ACCOUNT','SAVINGS','BUSINESS') NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (bank_details_id)
);

CREATE TABLE IF NOT EXISTS signature (
	signature_id INT NOT NULL AUTO_INCREMENT,
	place VARCHAR (150) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (signature_id)
);

CREATE TABLE IF NOT EXISTS shares (
	shares_id INT NOT NULL AUTO_INCREMENT,
	total INT NOT NULL,
	event ENUM('CREATED','ISSUED') NOT NULL,
	type ENUM('ORDINARY','PREFERENCE','NON-VOTING ORDINARY','REDEEMABLE','CUMULATIVE PREFERENCE','REDEEMABLE PREFERENCE') NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (shares_id)
);

CREATE TABLE IF NOT EXISTS share_price (
	share_price_id INT NOT NULL AUTO_INCREMENT,
	type ENUM('ORDINARY','PREFERENCE','NON-VOTING ORDINARY','REDEEMABLE','CUMULATIVE PREFERENCE','REDEEMABLE PREFERENCE') NOT NULL,
	amount INT NOT NULL,
	date DATETIME NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (share_price_id)
);

CREATE TABLE IF NOT EXISTS share_purchase (
	share_purchase_id INT NOT NULL AUTO_INCREMENT,
	amount INT NOT NULL,
	proof_of_payment VARCHAR (65535) NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (share_purchase_id)
);

CREATE TABLE IF NOT EXISTS consent (
	consent_id INT NOT NULL AUTO_INCREMENT,
	content VARCHAR (300) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (consent_id)
);

ALTER TABLE share_purchase ADD shareholder INT NOT NULL AFTER share_purchase_id, ADD INDEX (shareholder);
				ALTER TABLE share_purchase 
				ADD CONSTRAINT fk_share_purchase_shareholder
				FOREIGN KEY (shareholder)
				REFERENCES shareholder (shareholder_id)
				ON DELETE RESTRICT
				ON UPDATE CASCADE;
			ALTER TABLE share_purchase ADD share_price INT NOT NULL AFTER share_purchase_id, ADD INDEX (share_price);
				ALTER TABLE share_purchase 
				ADD CONSTRAINT fk_share_purchase_share_price
				FOREIGN KEY (share_price)
				REFERENCES share_price (share_price_id)
				ON DELETE RESTRICT
				ON UPDATE CASCADE;
			