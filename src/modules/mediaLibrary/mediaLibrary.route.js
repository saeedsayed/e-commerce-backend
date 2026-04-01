import express from "express";
import { checkToken, restrictTo } from "../../middlewares/auth.middleware.js";
import roles from "../../constants/roles.constant.js";
import {
  getMediaLibrary,
  uploadFiles,
  createFolder,
  getFolders,
  getFolder,
  deleteFiles,
  deleteFolder,
} from "./mediaLibrary.controller.js";

const router = express.Router();

router.route("/").get(checkToken, restrictTo(roles.ADMIN), getMediaLibrary);

router
  .route("/folders")
  .get(checkToken, restrictTo(roles.ADMIN), getFolders)
  .post(checkToken, restrictTo(roles.ADMIN), createFolder);

router
  .route("/folders/:folderName")
  .get(checkToken, restrictTo(roles.ADMIN), getFolder)
  // .put(checkToken, restrictTo(roles.ADMIN), updateFolder)
  .delete(checkToken, restrictTo(roles.ADMIN), deleteFolder);

router
  .route("/folders/:folderName/files")
  .post(checkToken, restrictTo(roles.ADMIN), uploadFiles)
  .delete(checkToken, restrictTo(roles.ADMIN), deleteFiles);

export default router;
