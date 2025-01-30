import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { File } from "../models/file.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uplodOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";


const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

export const registerUser = asyncHandler( async (req, res) => {
    
    //get user detail from frontend(form, json, url) if coming from form or json we can extract it from req.body
    const {username, fullName, email, password} = req.body
    //validation - not empty
    if (
        [fullName, email, username, password].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exist: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already existed")
    }
    
    //check for images, check for avatar @server
    const avatarLocalPath = req.files?.avatar[0]?.path;// file path of avatar
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;//file path of coverimage
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //upload them to cloudnary, check @cloudinary
    const avatar = await uplodOnCloudinary(avatarLocalPath)
    //->const coverImage = await uplodOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

   
    //create user object - create entry call in db
    const user = await User.create({
        fullName: fullName.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username
    })
    

    //remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //return res if created 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

export const loginUser = asyncHandler( async (req, res) => {
    /*
    1. req.body-> userId, email, password
    2. check if userexisted or not
    3. check on password
    4. if existed generate user access-token and refresh-token
    5. send these token in cookies and send res.
    */
   const {username, email, password}= req.body 
   if (!username || !email) {
    throw new ApiError(400, "username or email required")
   }

   const user = await User.findOne({
    $or: [{ username }, { email }]
   })
   if (!user) {
    throw new ApiError(400, "user do not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password")
   }

   const { accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



   //options design for cookies
   const options = {
        httpOnly: true,
        secure: true    
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in Successfully"
        )
   )
})

export const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true    
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User loggedOut"))

})


