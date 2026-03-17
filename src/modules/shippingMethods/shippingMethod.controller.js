import STATUS from "../../constants/httpStatus.constant.js";
import ShippingMethods from "./shippingMethod.model.js";
import appError from "../../utils/appError.js";

export const getShippingMethods = async (req, res, next) => {
  const filter = req.filter;
  const shippingMethods = await ShippingMethods.find({
    isActive: true,
    ...filter,
  });
  res.json({
    status: STATUS.SUCCESS,
    data: shippingMethods,
  });
};

export const createShippingMethod = async (req, res, next) => {
  try {
    const {
      name,
      description,
      cost,
      estimatedDeliveryDays,
      regions,
      isActive = true,
    } = req.body;
    const newShippingMethod = new ShippingMethods({
      name,
      description,
      cost,
      estimatedDeliveryDays,
      regions,
      isActive,
    });
    await newShippingMethod.save();
    res.status(201).json({
      status: STATUS.SUCCESS,
      data: newShippingMethod,
    });
  } catch (error) {
    next(error);
  }
};

export const getShippingMethodByIdController = async (req, res, next) => {
  try {
    const shippingMethodId = req.params.id;
    const shippingMethod = await ShippingMethods.findById(shippingMethodId);
    if (!shippingMethod) {
      const err = appError.create(
        "Shipping method not found",
        404,
        STATUS.FAIL,
      );
      return next(err);
    }
    res.json({
      status: STATUS.SUCCESS,
      data: shippingMethod,
    });
  } catch (error) {
    next(error);
  }
};
export const updateShippingMethod = async (req, res, next) => {
  try {
    const shippingMethodId = req.params.id;
    const {
      name,
      description,
      cost,
      estimatedDeliveryDays,
      regions,
      isActive,
    } = req.body;
    const updatedShippingMethod = await ShippingMethods.findByIdAndUpdate(
      shippingMethodId,
      {
        name,
        description,
        cost,
        estimatedDeliveryDays,
        regions,
        isActive,
      },
      { new: true },
    );
    if (!updatedShippingMethod) {
      const err = appError.create(
        "Shipping method not found",
        404,
        STATUS.NOT_FOUND,
      );
      return next(err);
    }
    res.json({
      status: STATUS.SUCCESS,
      data: updatedShippingMethod,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShippingMethod = async (req, res, next) => {
  try {
    const shippingMethodId = req.params.id;
    const deletedShippingMethod =
      await ShippingMethods.findByIdAndDelete(shippingMethodId);
    if (!deletedShippingMethod) {
      const err = appError.create(
        "Shipping method not found",
        404,
        STATUS.NOT_FOUND,
      );
      return next(err);
    }
    res.json({
      status: STATUS.SUCCESS,
      message: "Shipping method deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
