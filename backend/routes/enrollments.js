const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { query: dbQuery } = require('../config/database');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/enrollments - Obtenir toutes les inscriptions
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit doit être entre 1 et 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT e.*, 
             u.first_name as parent_first_name, u.last_name as parent_last_name, u.email as parent_email,
             c.first_name as child_first_name, c.last_name as child_last_name, c.birth_date
      FROM enrollments e
      INNER JOIN users u ON e.parent_id = u.id
      INNER JOIN children c ON e.child_id = c.id
      WHERE 1=1
    `;
    let params = [];

    // Si l'utilisateur est un parent, ne montrer que ses inscriptions
    if (req.user.role === 'parent') {
      sql += ' AND e.parent_id = ?';
      params.push(req.user.id);
    }

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const enrollments = await dbQuery(sql, params);
    
    // Compter le total
    let countSql = 'SELECT COUNT(*) as total FROM enrollments e WHERE 1=1';
    let countParams = [];
    
    if (req.user.role === 'parent') {
      countSql += ' AND e.parent_id = ?';
      countParams.push(req.user.id);
    }
    
    if (status) {
      countSql += ' AND e.status = ?';
      countParams.push(status);
    }
    
    const countResult = await dbQuery(countSql, countParams);
    const total = countResult[0].total;

    res.json({
      message: 'Inscriptions récupérées avec succès',
      enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des inscriptions'
    });
  }
});

// POST /api/enrollments - Créer une nouvelle inscription
router.post('/', [
  authenticateToken,
  body('child_id')
    .isInt({ min: 1 })
    .withMessage('ID enfant invalide'),
  body('enrollment_date')
    .isISO8601()
    .withMessage('Date d\'inscription invalide (format YYYY-MM-DD)'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes trop longues')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { child_id, enrollment_date, notes } = req.body;
    const parent_id = req.user.role === 'parent' ? req.user.id : req.body.parent_id;

    if (!parent_id) {
      return res.status(400).json({
        error: 'ID parent requis'
      });
    }

    // Vérifier si l'enfant existe
    const childCheck = await dbQuery('SELECT id FROM children WHERE id = ? AND is_active = TRUE', [child_id]);
    if (childCheck.length === 0) {
      return res.status(404).json({
        error: 'Enfant non trouvé'
      });
    }

    // Vérifier si une inscription existe déjà
    const existingEnrollment = await dbQuery(
      'SELECT id FROM enrollments WHERE parent_id = ? AND child_id = ?',
      [parent_id, child_id]
    );
    
    if (existingEnrollment.length > 0) {
      return res.status(409).json({
        error: 'Une inscription existe déjà pour cet enfant et ce parent'
      });
    }

    const sql = `
      INSERT INTO enrollments (parent_id, child_id, enrollment_date, notes)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await dbQuery(sql, [parent_id, child_id, enrollment_date, notes]);
    
    // Récupérer l'inscription créée
    const enrollmentSql = `
      SELECT e.*, 
             u.first_name as parent_first_name, u.last_name as parent_last_name,
             c.first_name as child_first_name, c.last_name as child_last_name
      FROM enrollments e
      INNER JOIN users u ON e.parent_id = u.id
      INNER JOIN children c ON e.child_id = c.id
      WHERE e.id = ?
    `;
    
    const enrollment = await dbQuery(enrollmentSql, [result.insertId]);

    res.status(201).json({
      message: 'Inscription créée avec succès',
      enrollment: enrollment[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de l\'inscription'
    });
  }
});

// PUT /api/enrollments/:id - Mettre à jour une inscription (staff seulement)
router.put('/:id', [
  authenticateToken,
  requireStaff,
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'cancelled'])
    .withMessage('Statut invalide'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes trop longues')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const enrollmentId = parseInt(req.params.id);
    
    if (isNaN(enrollmentId)) {
      return res.status(400).json({
        error: 'ID inscription invalide'
      });
    }

    const { status, notes } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Aucune donnée à mettre à jour'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(enrollmentId);

    const sql = `UPDATE enrollments SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await dbQuery(sql, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Inscription non trouvée'
      });
    }

    res.json({
      message: 'Inscription mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'inscription'
    });
  }
});

module.exports = router;
