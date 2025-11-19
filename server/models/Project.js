import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  // Step 1 - Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectDescription: {
    type: String,
    required: true,
    trim: true
  },
  linkedProfile: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Linked profile must be a valid URL'
    }
  },
  
  // Step 2 - Project Details & Resources
  videoLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Video link must be a valid URL'
    }
  },
  flowFileLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Flow file link must be a valid URL'
    }
  },
  deployedLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Deployed link must be a valid URL'
    }
  },
  instructionDocumentLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Instruction document link must be a valid URL'
    }
  },
  backgroundImage: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String, // Path where the image is stored
    url: String   // Public URL to access the image
  },
  categories: [{
    type: String,
    enum: [
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
    ]
  }],
  tools: [{
    type: String,
    trim: true
  }],
  
  // Step 3 - Review & Rating
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
projectSchema.index({ name: 'text', projectName: 'text', projectDescription: 'text' });
projectSchema.index({ categories: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdBy: 1 });

export default mongoose.model('Project', projectSchema);
