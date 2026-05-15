const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Delete a single asset from Cloudinary by its public_id.
 * Always call this before deleting any DB record that has a Cloudinary URL.
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn(`⚠️  Cloudinary delete issue for ${publicId}:`, result);
    }
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary delete error for ${publicId}:`, error.message);
    throw error;
  }
};

/**
 * Delete multiple Cloudinary assets at once.
 * Pass an array of publicIds.
 */
const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  if (!publicIds || publicIds.length === 0) return;
  const validIds = publicIds.filter(Boolean);
  if (validIds.length === 0) return;

  try {
    const result = await cloudinary.api.delete_resources(validIds, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('❌ Cloudinary bulk delete error:', error.message);
    throw error;
  }
};

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder path (e.g. 'tenants/slug/products')
 * @param {object} options - Additional Cloudinary upload options
 * @returns {object} - { url, publicId }
 */
const uploadToCloudinary = (fileBuffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error.message);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Extract the Cloudinary public_id from a full secure URL.
 * e.g. "https://res.cloudinary.com/cloud/image/upload/v123/folder/name.jpg"
 *      → "folder/name"
 */
const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  try {
    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Skip the version segment (v12345) if present
    let startIndex = uploadIndex + 1;
    if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
      startIndex++;
    }
    const publicIdWithExt = urlParts.slice(startIndex).join('/');
    // Remove file extension
    return publicIdWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

// Multer memory storage (files held in buffer before Cloudinary upload)
const memoryStorage = multer.memoryStorage();

const createUploadMiddleware = (options = {}) => {
  return multer({
    storage: memoryStorage,
    limits: {
      fileSize: options.maxSize || 5 * 1024 * 1024, // default 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
      }
    },
  });
};

module.exports = {
  cloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  uploadToCloudinary,
  extractPublicId,
  createUploadMiddleware,
};
