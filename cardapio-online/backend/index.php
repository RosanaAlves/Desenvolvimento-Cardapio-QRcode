<?php
echo "<h1> Cardápio Online Backend</h1>";
echo "<p>Backend Laravel em construção...</p>";
echo "<p>MySQL Host: " . getenv('DB_HOST') . "</p>";
echo "<p>Database: " . getenv('DB_DATABASE') . "</p>";

// Testar conexão com MySQL
try {
    $pdo = new PDO(
        'mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    echo "<p style='color: green;'> Conexão com MySQL bem-sucedida!</p>";
} catch (PDOException $e) {
    echo "<p style='color: red;'> Erro MySQL: " . $e->getMessage() . "</p>";
}
?>
