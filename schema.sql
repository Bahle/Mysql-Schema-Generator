CREATE DATABASE IF NOT EXISTS leselihub; 
USE leselihub;

CREATE TABLE IF NOT EXISTS tenders (
	tenders_id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR (80) NOT NULL,
	description TEXT NOT NULL,
	cover_image VARCHAR (512) NOT NULL,
	tags VARCHAR (512) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (tenders_id)
);

CREATE TABLE IF NOT EXISTS vacancies (
	vacancies_id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR (80) NOT NULL,
	description TEXT NOT NULL,
	cover_image VARCHAR (512) NOT NULL,
	tags VARCHAR (512) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (vacancies_id)
);

CREATE TABLE IF NOT EXISTS interviews (
	interviews_id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR (80) NOT NULL,
	description TEXT NOT NULL,
	cover_image VARCHAR (512) NOT NULL,
	cover_video VARCHAR (512) NOT NULL,
	tags VARCHAR (512) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (interviews_id)
);

CREATE TABLE IF NOT EXISTS press_release (
	press_release_id INT NOT NULL AUTO_INCREMENT,
	title VARCHAR (80) NOT NULL,
	description TEXT NOT NULL,
	cover_image VARCHAR (512) NOT NULL,
	tags VARCHAR (512) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (press_release_id)
);

CREATE TABLE IF NOT EXISTS directory (
	directory_id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR (100) NOT NULL,
	description TEXT NOT NULL,
	email VARCHAR (512) NOT NULL,
	phone VARCHAR (200) NOT NULL,
	website VARCHAR (512) NOT NULL,
	logo VARCHAR (512) NOT NULL,
	tags VARCHAR (512) NOT NULL,
	address TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (directory_id)
);

CREATE TABLE IF NOT EXISTS author (
	author_id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR (80) NOT NULL,
	surname VARCHAR (80) NOT NULL,
	email VARCHAR (255) NOT NULL,
	password VARCHAR (80) NOT NULL,
	picture VARCHAR (512) NOT NULL,
	about TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (author_id)
);

CREATE TABLE IF NOT EXISTS ad (
	ad_id INT NOT NULL AUTO_INCREMENT,
	company VARCHAR (100) NOT NULL,
	image VARCHAR (512) NOT NULL,
	post_type VARCHAR (50) NOT NULL,
	created_at TIMESTAMP NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (ad_id)
);

CREATE TABLE IF NOT EXISTS ad_period (
	ad_period_id INT NOT NULL AUTO_INCREMENT,
	duration_from DATE NOT NULL,
	duration_to DATE NOT NULL,
	price DECIMAL(8,6) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (ad_period_id)
);

CREATE TABLE IF NOT EXISTS admin (
	admin_id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR (80) NOT NULL,
	surname VARCHAR (80) NOT NULL,
	email VARCHAR (255) NOT NULL,
	password VARCHAR (80) NOT NULL,
	deleted BOOLEAN DEFAULT 0,
	PRIMARY KEY (admin_id)
);

ALTER TABLE tenders ADD author INTEGER NOT NULL AFTER tenders_id, ADD INDEX (author);
				ALTER TABLE tenders 
				ADD CONSTRAINT fk_tenders_author
				FOREIGN KEY (author)
				REFERENCES author (author_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE;
			ALTER TABLE vacancies ADD author INTEGER NOT NULL AFTER vacancies_id, ADD INDEX (author);
				ALTER TABLE vacancies 
				ADD CONSTRAINT fk_vacancies_author
				FOREIGN KEY (author)
				REFERENCES author (author_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE;
			ALTER TABLE interviews ADD author INTEGER NOT NULL AFTER interviews_id, ADD INDEX (author);
				ALTER TABLE interviews 
				ADD CONSTRAINT fk_interviews_author
				FOREIGN KEY (author)
				REFERENCES author (author_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE;
			ALTER TABLE press_release ADD author INTEGER NOT NULL AFTER press_release_id, ADD INDEX (author);
				ALTER TABLE press_release 
				ADD CONSTRAINT fk_press_release_author
				FOREIGN KEY (author)
				REFERENCES author (author_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE;
			ALTER TABLE ad ADD post INTEGER NOT NULL AFTER ad_id, ADD INDEX (post);
				ALTER TABLE ad 
				ADD CONSTRAINT fk_ad_post
				FOREIGN KEY (post)
				REFERENCES post (post_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE;
			ALTER TABLE ad_period ADD ad INTEGER NOT NULL AFTER ad_period_id, ADD INDEX (ad);
				ALTER TABLE ad_period 
				ADD CONSTRAINT fk_ad_period_ad
				FOREIGN KEY (ad)
				REFERENCES ad (ad_id)
				ON DELETE CASCADE
				ON UPDATE CASCADE;
			