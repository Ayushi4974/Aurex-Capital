const mongoose = require('mongoose');

const binaryTreeSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  parentId: { type: String, default: '' },
  position: { type: String, enum: ['left', 'right', ''], default: '' },
  leftChild: { type: String, default: '' },
  rightChild: { type: String, default: '' },
  depth: { type: Number, default: 0 },
  path: { type: String, default: '' }, // e.g. "/AC100001/AC100002/AC100004"
}, { timestamps: true });

module.exports = mongoose.model('BinaryTree', binaryTreeSchema);
