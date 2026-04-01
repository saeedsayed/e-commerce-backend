import user from "./user.model.js";
import appError from "../../utils/appError.js";
import { clearTempFile } from "../../utils/clearTempFile.js";
import cloudinary from "../../utils/cloudinary.js";
import STATUS from "../../constants/httpStatus.constant.js";

export const getAllUsers = async (req, res, next) => {
  const allUsers = await user.find();
  res.json({ status: STATUS.SUCCESS, data: allUsers });
};

export const updateProfilePicture = async (req, res, next) => {
  const { profilePicture } = req.files;
  const userId = req.userId;
  // validation
  if (!profilePicture) {
    const err = appError.create(
      "Profile picture is required",
      400,
      STATUS.FAIL,
    );
    return next(err);
  }
  // upload to cloudinary and save to media library on db
  await cloudinary.uploader.destroy("profile_pictures/" + userId); // delete previous picture
  const pictureUrl = await cloudinary.uploader.upload(
    profilePicture.tempFilePath,
    { folder: "profile_pictures", public_id: userId },
  );
  // clean temp file
  clearTempFile(profilePicture.tempFilePath);
  // update user profile picture
  const updatedUser = await user.findByIdAndUpdate(
    userId,
    { avatar: pictureUrl.secure_url },
    { new: true },
  );
  if (!updatedUser) {
    const err = appError.create("User not found", 404, STATUS.FAIL);
    return next(err);
  }
  res.json({
    status: STATUS.SUCCESS,
    data: updatedUser,
    message: "Profile picture updated successfully",
  });
  res.end();
};
