const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  
  try {
    // Configuration de la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Ajustez selon votre configuration
      database: 'creche_db'
    });

    console.log('🔗 Connexion à la base de données établie');

    // Vérifier si les colonnes existent déjà
    const [columns] = await connection.execute('SHOW COLUMNS FROM enrollments');
    const existingColumns = columns.map(col => col.Field);
    console.log('📋 Colonnes existantes:', existingColumns);

    // Ajouter les nouvelles colonnes si elles n'existent pas
    const newColumns = [
      { name: 'parent_first_name', type: 'VARCHAR(100)' },
      { name: 'parent_last_name', type: 'VARCHAR(100)' },
      { name: 'parent_email', type: 'VARCHAR(255)' },
      { name: 'parent_password', type: 'VARCHAR(255)' },
      { name: 'parent_phone', type: 'VARCHAR(20)' }
    ];

    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        const query = `ALTER TABLE enrollments ADD COLUMN ${column.name} ${column.type}`;
        await connection.execute(query);
        console.log(`✅ Colonne ${column.name} ajoutée`);
      } else {
        console.log(`⚠️ Colonne ${column.name} existe déjà`);
      }
    }

    // Supprimer medical_record si elle existe
    if (existingColumns.includes('medical_record')) {
      await connection.execute('ALTER TABLE enrollments DROP COLUMN medical_record');
      console.log('✅ Colonne medical_record supprimée');
    } else {
      console.log('⚠️ Colonne medical_record n\'existe pas');
    }

    // Mettre à jour les valeurs NULL de lunch_assistance
    await connection.execute('UPDATE enrollments SET lunch_assistance = FALSE WHERE lunch_assistance IS NULL');
    console.log('✅ Valeurs NULL de lunch_assistance mises à jour');

    // Créer l'index sur parent_email si il n'existe pas
    try {
      await connection.execute('CREATE INDEX idx_enrollments_parent_email ON enrollments(parent_email)');
      console.log('✅ Index sur parent_email créé');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️ Index sur parent_email existe déjà');
      } else {
        console.log('❌ Erreur lors de la création de l\'index:', error.message);
      }
    }

    console.log('🎉 Migration terminée avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter la migration
runMigration();
