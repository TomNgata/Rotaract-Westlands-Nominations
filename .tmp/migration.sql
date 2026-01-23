
-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    rotary_id TEXT,
    role TEXT,
    year_joined INTEGER,
    email TEXT,
    phone_number TEXT
);

-- Create office_bearers table
CREATE TABLE IF NOT EXISTS office_bearers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT,
    full_name TEXT,
    email TEXT,
    phone_number TEXT
);

-- Clear existing data to avoid duplicates on re-run (optional, be careful in prod)
TRUNCATE TABLE members;
TRUNCATE TABLE office_bearers;


    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Cindy Amoit', '12284398', 'Member', 2025, 'cindyamoit@gmail.com', '+254746915970');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Lyon Anemba', '12285420', 'Member', 2025, 'anembaleon@gmail.com', '+254710253180');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Betty Baya', '11754551', 'Member', 2025, 'bayakemunto12@gmail.com', '+2540796515363');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Whitney Chao', '12411950', 'Member', 2025, 'whitneychao.m@gmail.com', '+254716488119');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Annette Djaling', '12072918', 'Member', 2024, 'annettedjaling22@gmail.com', '+254740379844');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Eva Gaicugi', '11787419', 'Club President', 2025, 'evagerald20@gmail.com', '+2540711274460');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Victor Muthumbi Kabugu', '12072931', 'Member', 2024, 'muthumbikabugu@yahoo.com', '+254705914025');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Lisbeth Kamau', '12284401', 'Member', 2025, 'kamaulisbeth@gmail.com', '+254718530545');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Perpetual Gathoni Kamau', '10376692', 'Member', 2025, 'perpsgatkamau@gmail.com', '+254711481194');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Morgan Kibet', '12051768', 'Member', 2025, 'kibetmorgan3@gmail.com', '+2540704695893');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Ashley Wambui Kihonge', '11157798', 'Member', 2024, 'ashleykihonge@gmail.com', 'N/A');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Louis Kimani', '12301917', 'Member', 2025, 'kimanilouis5@gmail.com', '+254791389776');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Whitney Kimutai', '11982990', 'Treasurer', 2025, 'kimutaiwhitney@gmail.com', '+254740832123');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Victoria Koba', '11787423', 'Member', 2023, 'victoria.main100@gmail.com', '+2540721969774');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Lynn Machua', '11771312', 'Club Foundation Chair', 2025, 'lynnmachuamark@gmail.com', '+2540723760305');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Sharon Makena', '11787414', 'Member', 2023, 'Makenamburugu9@gmail.com', '+2540799595537');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Nelson Mandela', '11787424', 'Member', 2023, 'nomandela8@gmail.com', '+2540721965137');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Edita Marion', '11787416', 'Club Secretary', 2025, 'editamarion111@gmail.com', '+2540791365479');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Sano Mashako', '12285338', 'Member', 2025, 'sanomashako@gmail.com', '+254787976867');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Carol Muriithi', '12411955', 'Member', 2025, 'cwmuriithi20@gmail.com', '+254717887675');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Leone Mutahi', '12072937', 'Club Vice President', 2025, 'leonmutahi@gmail.com', '+254726662887');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Joy Muthoga', '11787422', 'Honorary', 2024, 'joymuthoga@gmail.com', '+2540704000355');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Victoria Muthoni', '10417555', 'Member', 2025, 'waiyegovictoria@gmail.com', '+254704432797');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Esther Muthoni Nderitu', '12072922', 'RYL Contact', 2025, 'esthernderitu68@gmail.com', '+254748039826');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Thomas Ngata', '11509053', 'Learning Facilitator', 2025, 'tom.ngata@gmail.com', 'N/A');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Lesley Nabwire Nyongesa', '10645280', 'Club Membership Chair', 2025, 'lesleynabwire6@gmail.com', 'N/A');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Trizer Odhiambo', '12411944', 'Member', 2025, 'trizerodhiambo51@gmail.com', '+254704072059');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Diana Achieng Okech', '10831676', 'Member', 2025, 'dianasharong@gmail.com', '+254712114554');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Anthony Ejakait Onyain', '11900704', 'Member', 2023, 'onyainantony1993@gmail.com', '+254701283762');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('David Aqwiri Onyango', '10675908', 'Rotaract Advisor', 2025, 'aqdave61@gmail.com', 'N/A');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Mildred Otaba Otaba', '10535476', 'Public Image Chair', 2025, 'mildredotaba@gmail.com', '+2540716343679');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Fiona Otieno', '12284228', 'Member', 2025, 'otienofiona3@gmail.com', '+254798023154');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Moureen Owino', '12285432', 'Member', 2025, 'moureenowino@gmail.com', '+254708412499');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Ian Walter Sikobe', '12072926', 'Service Projects Chair', 2025, 'ianwalter309@gmail.com', '+254716561507');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Winnie Teresia', '12285470', 'Member', 2025, 'teresiawinnie67@gmail.com', '+254705220637');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Annabel Wanjiku', '12072947', 'Honorary', 2024, 'annabelnjiks@gmail.com', '+254100301231');
    

    INSERT INTO members (full_name, rotary_id, role, year_joined, email, phone_number)
    VALUES ('Faith Wanjohi', '12285444', 'Member', 2025, 'faithwanjohi69@gmail.com', '+254711654969');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Club President', 'Eva Gaicugi', 'evagerald20@gmail.com', '+2540711274460');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Club Vice President', 'Leone Mutahi', 'leonmutahi@gmail.com', '+254726662887');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Club Secretary', 'Edita Marion', 'editamarion111@gmail.com', '+2540791365479');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Treasurer', 'Whitney Kimutai', 'kimutaiwhitney@gmail.com', '+254740832123');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Club Membership Chair', 'Lesley Nabwire Nyongesa', 'lesleynabwire6@gmail.com', 'N/A');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Club Public Image Chair', 'Mildred Otaba Otaba', 'mildredotaba@gmail.com', '+2540716343679');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Club Service Projects Chair', 'Ian Walter Sikobe', 'ianwalter309@gmail.com', '+254716561507');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Club Foundation Chair', 'Lynn Machua', 'lynnmachuamark@gmail.com', '+2540723760305');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Rotaract Young Leaders Contact', 'Esther Muthoni Nderitu', 'esthernderitu68@gmail.com', '+254748039826');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Rotaract Learning Facilitator', 'Thomas Ngata', 'tom.ngata@gmail.com', 'N/A');
    

    INSERT INTO office_bearers (role, full_name, email, phone_number)
    VALUES ('Rotaract Advisor', 'David Aqwiri Onyango', 'aqdave61@gmail.com', 'N/A');
    