<?php

	$day = date("Y-m-d");
	$global = "../../data/earlyaccess/emails.txt";
	$daily  = "../../data/earlyaccess/" . $day . ".txt";
	$email = $_POST["email"] . "\n";
	
	file_put_contents($daily , $email, FILE_APPEND | LOCK_EX);
	file_put_contents($global, $email, FILE_APPEND | LOCK_EX);
		
?>
ok