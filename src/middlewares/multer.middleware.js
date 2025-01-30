import multer from "multer"

const storage = multer.diskStorage({
    //I intentially store files in diskStorge as if store in memoryStorage result in server down or freeze
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
  
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if(
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/pdf"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      throw new ApiError(400, "invalid file type")
    }
  }
 })//for es6 {storage}