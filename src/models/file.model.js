import mongoose, {Schema} from "mongoose"


const fileSchema = new Schema({
    fileName: {
        type: String,
        required: true,
        unique: true,
    },
    fileSize: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    file: {
        type: String,//cloudinary url
        required: true,
    }
},
{
    timestamps: true
})

export const File = mongoose.model("File", fileSchema)