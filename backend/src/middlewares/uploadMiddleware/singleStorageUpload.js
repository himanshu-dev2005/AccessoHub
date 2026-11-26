const multer = require('multer');
const path = require('path');
const { slugify } = require('transliteration');

const fileFilter = require('./utils/LocalfileFilter');

const singleStorageUpload = ({
  entity,
  fileType = 'default',
  uploadFieldName = 'file',
  fieldName = 'file',
}) => {
  const filterType = fileFilter(fileType);
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: filterType,
  }).single(uploadFieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          result: null,
          message: err.message || 'File upload failed',
        });
      }

      if (req.file) {
        const fileExtension = path.extname(req.file.originalname);
        const uniqueFileID = Math.random().toString(36).slice(2, 7);
        const baseName = req.body?.seotitle
          ? slugify(String(req.body.seotitle).toLocaleLowerCase())
          : slugify(req.file.originalname.split('.')[0].toLocaleLowerCase());
        const fileName = `${baseName}-${uniqueFileID}${fileExtension}`;
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        req.upload = {
          fileName,
          fieldExt: fileExtension,
          entity,
          fieldName,
          fileType,
          filePath: dataUri,
        };
        req.body[fieldName] = dataUri;
      }

      next();
    });
  };
};

module.exports = singleStorageUpload;
