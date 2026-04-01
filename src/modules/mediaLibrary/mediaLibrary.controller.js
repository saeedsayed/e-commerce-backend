import appError from "../../utils/appError.js";
import STATUS from "../../constants/httpStatus.constant.js";
import cloudinary from "../../utils/cloudinary.js";
import { clearTempFile } from "../../utils/clearTempFile.js";

const getMediaLibrary = async (req, res, next) => {
  const { folders: rootFolders } = await cloudinary.api.root_folders();
  const mediaLibrary = await Promise.all(
    rootFolders
      .filter((folder) => folder.name !== "profile_pictures")
      .map(async (folder) => {
        const { resources: assets } =
          await cloudinary.api.resources_by_asset_folder(folder.name);
        return {
          folderName: folder.name,
          assets,
        };
      }),
  );
  res.status(200).json({
    status: "success",
    data: {
      mediaLibrary,
    },
  });
};
const getFolders = async (req, res, next) => {
  const { folders: rootFolders } = await cloudinary.api.root_folders();
  res.status(200).json({
    status: "success",
    data: {
      rootFolders,
    },
  });
};
const getFolder = async (req, res, next) => {
  const { folderName } = req.params;
  try {
    const { resources: assets } =
      await cloudinary.api.resources_by_asset_folder(folderName, {
        max_results: 500,
      });
    res.status(200).json({
      status: "success",
      data: {
        folderName: folderName,
        assets,
      },
    });
  } catch {
    return next(appError.create("Folder not found", 404, STATUS.FAIL));
  }
};

const uploadFiles = async (req, res, next) => {
  const media = req?.files?.media;
  const { folderName } = req.params;
  if (!media) {
    const err = appError.create("No files uploaded", 400, STATUS.FAIL);
    return next(err);
  }
  const arrOfMedia = Array.isArray(media) ? media : [media];
  if (folderName === "profile_pictures") {
    const err = appError.create(
      "You cannot upload files to this folder",
      400,
      STATUS.FAIL,
    );
    return next(err);
  }
  // upload files to cloudinary
  await Promise.all(
    arrOfMedia.map(async (file) => {
      const filePath = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: folderName,
      });
      clearTempFile(file.tempFilePath);
      return { fileUrl: filePath.secure_url, publicId: filePath.public_id };
    }),
  );
  const { resources: newAssets } =
    await cloudinary.api.resources_by_asset_folder(folderName);
  res.status(200).json({
    status: STATUS.SUCCESS,
    data: newAssets,
    message: "Files uploaded successfully",
  });
};

const createFolder = async (req, res, next) => {
  const { folderName } = req.body;
  const lowerFolderName = folderName?.toLowerCase()?.trim();
  if (!lowerFolderName) {
    const err = appError.create("Folder title is required", 400, STATUS.FAIL);
    return next(err);
  }
  // const existingFolder = await MediaLibrary.findOne({
  //   folderTitle: lowerFolderTitle,
  // });
  // if (existingFolder) {
  //   const err = appError.create("Folder already exists", 400, STATUS.FAIL);
  //   return next(err);
  // }
  const newFolder = await cloudinary.api.create_folder(lowerFolderName);
  res.status(201).json({
    status: "success",
    message: "Folder created successfully",
    data: {
      folder: newFolder,
    },
  });
};

const deleteFiles = async (req, res, next) => {
  const { fileIds } = req.body; // array of file ids to be deleted
  if (!Array.isArray(fileIds) || !fileIds) {
    const err = appError.create("Invalid file ids", 400, STATUS.FAIL);
    return next(err);
  }
  await cloudinary.api.delete_resources_by_asset_ids(fileIds);
  res.status(204).end();
};

const deleteFolder = async (req, res, next) => {
  const { folderName } = req.params;

  if (folderName === "profile_pictures") {
    const err = appError.create(
      "You cannot delete this folder",
      400,
      STATUS.FAIL,
    );
    return next(err);
  }
  // delete all folder from cloudinary
  await cloudinary.api.delete_resources_by_prefix(folderName + "/");
  await cloudinary.api.delete_folder(folderName);
  res.status(204).end();
};

export {
  getMediaLibrary,
  getFolders,
  getFolder,
  uploadFiles,
  createFolder,
  deleteFiles,
  deleteFolder,
};
