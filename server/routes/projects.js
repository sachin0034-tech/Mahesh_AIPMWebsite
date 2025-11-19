import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Project from '../models/Project.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/projects/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// POST /api/projects - Create a new project
router.post('/', auth, upload.single('backgroundImage'), async (req, res) => {
  try {
    const {
      name,
      projectName,
      projectDescription,
      linkedProfile,
      videoLink,
      flowFileLink,
      deployedLink,
      instructionDocumentLink,
      categories,
      tools,
      rating
    } = req.body;

    // Parse JSON arrays
    const categoriesArray = categories ? JSON.parse(categories) : [];
    const toolsArray = tools ? JSON.parse(tools) : [];

    // Prepare project data
    const projectData = {
      name,
      projectName,
      projectDescription,
      linkedProfile: linkedProfile || undefined,
      videoLink: videoLink || undefined,
      flowFileLink: flowFileLink || undefined,
      deployedLink: deployedLink || undefined,
      instructionDocumentLink: instructionDocumentLink || undefined,
      categories: categoriesArray,
      tools: toolsArray,
      rating: parseInt(rating) || 0,
      createdBy: req.user.id
    };

    // Handle file upload
    if (req.file) {
      projectData.backgroundImage = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/projects/${req.file.filename}`
      };
    }

    // Create new project
    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });

  } catch (error) {
    console.error('Error creating project:', error);
    
    // Clean up uploaded file if project creation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status = 'published' } = req.query;
    
    const query = { status };
    if (category) {
      query.categories = category;
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'email name')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'email name');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', auth, upload.single('backgroundImage'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const updateData = { ...req.body };
    
    // Parse JSON arrays if they exist
    if (updateData.categories) {
      updateData.categories = JSON.parse(updateData.categories);
    }
    if (updateData.tools) {
      updateData.tools = JSON.parse(updateData.tools);
    }

    // Handle new file upload
    if (req.file) {
      // Delete old file if it exists
      if (project.backgroundImage && project.backgroundImage.path && fs.existsSync(project.backgroundImage.path)) {
        fs.unlinkSync(project.backgroundImage.path);
      }

      updateData.backgroundImage = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/projects/${req.file.filename}`
      };
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'email name');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    
    // Clean up uploaded file if update fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user owns the project or is admin
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Delete associated file
    if (project.backgroundImage && project.backgroundImage.path && fs.existsSync(project.backgroundImage.path)) {
      fs.unlinkSync(project.backgroundImage.path);
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// GET /api/projects/categories - Get all categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    'AI Assistant',
    'Data Analysis',
    'Content Generation',
    'Automation',
    'Customer Service',
    'Marketing',
    'Development',
    'Design',
    'Research',
    'Other'
  ];

  res.json({
    success: true,
    data: categories
  });
});

export default router;
