-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2018 at 07:55 PM
-- Server version: 10.1.37-MariaDB
-- PHP Version: 7.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `maindata`
--

-- --------------------------------------------------------

--
-- Table structure for table `userdata`
--

CREATE TABLE `userdata` (
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` int(11) NOT NULL,
  `notif` int(11) NOT NULL DEFAULT '1',
  `pp` longtext NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `userdata`
--

INSERT INTO `userdata` (`name`, `surname`, `username`, `email`, `gender`, `notif`, `pp`, `password`) VALUES
('TREDX', 'pitout', '', '', 0, 1, '', ''),
('TREDX', 'pitout', '', '', 0, 1, '', ''),
('Tredeaux', 'Pitout', 'TREDX', 'tredeaux.pitout@gmail.com', 0, 1, '', '$2b$04$jb2EXEI66Ue24PdUtgwPdONUyGfT1fthO6UBKW/svIE0qh.nHBmIe'),
('Tredeaux', 'Pitout', 'TREDX', 'tredeaux.pitout@gmail.com', 0, 1, '', '$2b$04$isVpT5YjA4s26Uu6hrRoAeLhGydqSooN4w.2G6eXlbM3tgyYUszq.');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
