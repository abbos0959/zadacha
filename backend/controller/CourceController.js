const catchErrorAsync = require("../utils/catchUtil");
const AppError = require("../utils/appError");
const Cource = require("../model/courceModel");

const CreateCource = catchErrorAsync(async (req, res, next) => {
   const { name, description, price } = req.body;

   const cource = Cource.create({
      name,
      description,
      price,
      author: req.user,
   });
   res.status(200).json({
      message: "created cource",
      cource,
   });
});

const UpdateCource = catchErrorAsync(async (req, res, next) => {
   try {
      const id = req.params.id;

      const CourseId = Cource.findByIdAndUpdate(id, req.body);
      if (!CourseId) {
         return next(new AppError("Update bo'lmadi", 400));
      }
      res.status(200).json({
         message: "success",
         CourseId,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});
const DeleteCource = catchErrorAsync(async (req, res, next) => {
   try {
      const id = req.params.id;

      const CourseId = Cource.findByIdAndDelete(id);
      if (!CourseId) {
         return next(new AppError("Delete bo'lmadi", 400));
      }
      res.status(200).json({
         message: "success",
         CourseId,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});
const GetAllCource = catchErrorAsync(async (req, res, next) => {
   try {
      const CourseId = Cource.find();

      res.status(200).json({
         message: "success",
         CourseId,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const GetSingleCource = catchErrorAsync(async (req, res, next) => {
   try {
      const id = req.params.id;

      const CourseId = Cource.findOne(id);
      if (!CourseId) {
         return next(new AppError("Cource  topilmadi", 400));
      }
      res.status(200).json({
         message: "success",
         CourseId,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

module.exports = { CreateCource, UpdateCource, DeleteCource, GetAllCource, GetSingleCource };
