<?php
session_start(); // Start the session to store user data

$servername = "localhost";
$username = "root"; 
$password = "";     
$dbname = "eduflow";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    if (empty($email) || empty($password)) {
        header("Location: login/login.html?error=emptyfields");
        exit();
    }

    $sql = "SELECT * FROM login WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        // Verify the password
        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['id']; // Assuming 'id' is the user identifier
            header("Location: ../index.php");
            exit();
        } else {
            header("Location: login/login.html?error=wrongpassword");
            exit();
        }
    } else {
        header("Location: login/login.html?error=usernotfound");
        exit();
    }

    $stmt->close();
}

$conn->close();
?>
