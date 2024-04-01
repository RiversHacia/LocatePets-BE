CREATE TABLE `one_time_view_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `viewId` INT NOT NULL,
  `viewed_ts` DATETIME NOT NULL,
  PRIMARY KEY (`id`));


CREATE TABLE `one_time_view` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `viewKey` VARCHAR(100) NULL,
  `viewValue` VARCHAR(500) NULL,
  `viewDesc` VARCHAR(500) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `user_jwt_refresh` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(255) NOT NULL,
  `refresh_token` TEXT
);


CREATE TABLE sys_breeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(255),
    life_span VARCHAR(50),
    temperament VARCHAR(255),
    pet_type VARCHAR(50) NOT NULL DEFAULT 'unknown'
);


INSERT INTO sys_breeds (name, origin, life_span, temperament, pet_type)
VALUES
    ('Mixed Breed', 'Worldwide', '12-20 years', 'Varies', 'dog'),
    ('Labrador Retriever', 'Canada', '10-12 years', 'Outgoing,Even Tempered,Gentle,Agile,Intelligent,Trusting', 'dog'),
    ('German Shepherd', 'Germany', '9-13 years', 'Confident,Courageous,Intelligent,Loyal', 'dog'),
    ('Golden Retriever', 'Scotland', '10-12 years', 'Intelligent,Friendly,Reliable,Trustworthy,Confident', 'dog'),
    ('Bulldog', 'England', '8-10 years', 'Docile,Willful,Friendly', 'dog'),
    ('Beagle', 'England', '12-15 years', 'Even Tempered,Gentle,Amiable,Determined,Excitable', 'dog'),
    ('Poodle', 'Germany, France', '12-15 years', 'Intelligent,Active,Alert,Faithful,Trainable', 'dog'),
    ('Siberian Husky', 'Siberia', '12-14 years', 'Outgoing,Independent,Intelligent,Gentle', 'dog'),
    ('Rottweiler', 'Germany', '8-10 years', 'Good-natured,Devoted,Obedient,Fearless,Confident', 'dog'),
    ('Dachshund', 'Germany', '12-16 years', 'Playful,Curious,Brave', 'dog'),
    ('Boxer', 'Germany', '10-12 years', 'Fun-loving,Energetic,Loyal,Friendly', 'dog'),
    ('French Bulldog', 'England, France', '10-12 years', 'Adaptable,Playful,Smart', 'dog'),
    ('Yorkshire Terrier', 'England', '13-16 years', 'Bold,Independent,Confident,Intelligent', 'dog'),
    ('Pomeranian', 'Germany, Poland', '12-16 years', 'Playful,Friendly,Extroverted', 'dog'),
    ('Shih Tzu', 'Tibet', '10-16 years', 'Affectionate,Happy,Outgoing', 'dog'),
    ('Boston Terrier', 'United States', '11-13 years', 'Friendly,Bright,Amusing', 'dog'),
    ('Australian Shepherd', 'United States', '13-15 years', 'Smart,Work-oriented,Exuberant', 'dog'),
    ('Cocker Spaniel', 'Spain', '12-15 years', 'Gentle,Smart,Happy', 'dog'),
    ('Cavalier King Charles Spaniel', 'United Kingdom', '9-14 years', 'Affectionate,Gentle,Graceful,Courageous', 'dog'),
    ('Chihuahua', 'Mexico', '12-20 years', 'Lively,Devoted,Alert,Quick,Courageous', 'dog'),
    ('Border Collie', 'United Kingdom', '10-17 years', 'Intelligent,Energetic,Responsive,Alert,Agile', 'dog'),
    ('Shetland Sheepdog', 'Scotland', '12-14 years', 'Playful,Energetic,Intelligent,Trainable,Loyal', 'dog'),
    ('Doberman Pinscher', 'Germany', '10-13 years', 'Energetic,Alert,Loyal,Fearless,Intelligent', 'dog'),
    ('Great Dane', 'Germany', '7-10 years', 'Friendly,Dependable,Gentle,Confident,Loving', 'dog'),
    ('Bernese Mountain Dog', 'Switzerland', '7-10 years', 'Affectionate,Loyal,Intelligent,Faithful', 'dog'),
    ('Cane Corso', 'Italy', '9-12 years', 'Trainable,Reserved,Stable,Quiet,Protective', 'dog'),
    ('Rhodesian Ridgeback', 'Zimbabwe', '10-12 years', 'Loyal,Independent,Intelligent,Dignified,Sensitive', 'dog'),
    ('Mastiff', 'England', '6-12 years', 'Good-natured,Affectionate,Dignified,Protective,Calm', 'dog'),
    ('Basset Hound', 'France', '10-12 years', 'Tenacious,Friendly,Affectionate,Devoted,Sweet-Tempered', 'dog'),
    ('Akita', 'Japan', '10-15 years', 'Loyal,Courageous,Dignified,Affectionate,Alert', 'dog'),
    ('Alaskan Malamute', 'United States', '10-14 years', 'Affectionate,Loyal,Playful,Friendly,Dignified', 'dog'),
    ('Brittany', 'France', '12-14 years', 'Bright,Eager,Adaptable,Agile,Friendly', 'dog'),
    ('English Springer Spaniel', 'England', '12-14 years', 'Friendly,Playful,Obedient,Pliable,Courageous', 'dog'),
    ('West Highland White Terrier', 'Scotland', '12-16 years', 'Hardy,Independent,Courageous,Friendly,Alert', 'dog'),
    ('Pug', 'China', '12-15 years', 'Charming,Mischievous,Loving,Affectionate,Clever', 'dog');


INSERT INTO sys_breeds (name, origin, life_span, temperament, pet_type)
VALUES
    ('Mixed Breed', 'Worldwide', '12-20 years', 'Varies', 'cat'),
    ('Domestic Shorthair', 'Worldwide', '12-14 years', 'Affectionate,Playful,Intelligent', 'cat'),
    ('Persian', 'Iran', '12-17 years', 'Gentle,Calm,Loving', 'cat'),
    ('Maine Coon', 'United States', '12-15 years', 'Friendly,Affectionate,Playful,Intelligent', 'cat'),
    ('Ragdoll', 'United States', '12-17 years', 'Affectionate,Gentle,Calm', 'cat'),
    ('Bengal', 'United States', '12-16 years', 'Energetic,Playful,Intelligent', 'cat'),
    ('Abyssinian', 'Ethiopia', '9-15 years', 'Active,Energetic,Playful,Intelligent', 'cat'),
    ('British Shorthair', 'United Kingdom', '12-20 years', 'Calm,Easygoing,Affectionate', 'cat'),
    ('American Shorthair', 'United States', '15-20 years', 'Friendly,Affectionate,Playful,Calm', 'cat'),
    ('Scottish Fold', 'Scotland', '11-15 years', 'Loving,Gentle,Intelligent,Calm', 'cat'),
    ('Sphynx', 'Canada', '13-15 years', 'Energetic,Sociable,Affectionate,Loyal', 'cat'),
    ('Himalayan', 'United States', '9-15 years', 'Sweet-tempered,Calm,Sociable', 'cat'),
    ('Norwegian Forest Cat', 'Norway', '14-16 years', 'Friendly,Intelligent,Playful,Adaptable', 'cat'),
    ('Oriental Shorthair', 'United States', '10-15 years', 'Intelligent,Social,Loyal,Energetic', 'cat'),
    ('Russian Blue', 'Russia', '15-20 years', 'Quiet,Intelligent,Loyal,Affectionate', 'cat'),
    ('Savannah', 'United States', '12-20 years', 'Curious,Intelligent,Loyal', 'cat'),
    ('Siamese', 'Thailand', '12-15 years', 'Affectionate,Sociable,Intelligent,Playful', 'cat'),
    ('Turkish Angora', 'Turkey', '12-18 years', 'Affectionate,Intelligent,Playful,Energetic', 'cat');
