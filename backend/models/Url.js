const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  longUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must start with http:// or https://'
    }
  },
  hits: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for performance
urlSchema.index({ shortId: 1 });
urlSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);
