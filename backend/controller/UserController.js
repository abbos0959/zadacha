const UserModel = require("../model/userModel");
const catchErrorAsync = require("../utils/catchUtil");
const AppError = require("../utils/appError");
const jwtToken = require("../utils/jwtToken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { log } = require("console");

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const Register = catchErrorAsync(async (req, res, next) => {
   try {
      const { firstname, lastname, email, password } = req.body;

      if (password.toString().length < 3) {
         return next(
            new AppError("Parol uzunligi kamida 3 ta belgidan iborat bo'lishi kerak", 400)
         );
      }
      if (password.toString().length > 16) {
         return next(new AppError("Parol uzunligi  15 ta belgidan  oshmasligi kerak", 400));
      }

      const hash = await bcrypt.hash(password.toString(), 10);

      const isuser = await UserModel.findOne({ email });
      if (isuser) {
         return res.status(400).json({ message: "Bunday user allaqachon mavjud" });
      }

      const user = await UserModel.create({
         firstname,
         lastname,
         email,
         password: hash,
      });

      jwtToken(user, 200, res);
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const login = catchErrorAsync(async (req, res, next) => {
   try {
      const { email, password } = req.body;

      if (!email || !password) {
         return next(new AppError("siz email yoki parolni kiritmadingiz", 400));
      }
      const olduser = await UserModel.findOne({ email });
      if (!olduser) {
         return next(new AppError("bunday user mavjud emas", 400));
      }

      const ispassword = await bcrypt.compare(password.toString(), olduser.password);
      if (!ispassword) {
         return next(new AppError("Iltimos parolni tekshirib qaytadan tering"));
      }
      jwtToken(olduser, 200, res);
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const AllUsers = catchErrorAsync(async (req, res, next) => {
   try {
      console.log(req.headers, "headercha", req.cookies);

      const alluser = await UserModel.find();

      res.status(200).json({
         message: "success",
         alluser,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const DeleteUser = catchErrorAsync(async (req, res, next) => {
   try {
      const id = req.params.id;
      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
         return next(new AppError("bunday foydalanuvchi mavjud emas", 400));
      }
      res.status(200).json({
         message: "success",
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});
const SingleUser = catchErrorAsync(async (req, res, next) => {
   try {
      const { id } = req.params;
      const usercheckId = await mongoose.Types.ObjectId.isValid(id);

      const user = await UserModel.findById(id);
      if (!user) {
         return next(new AppError("bunday user mavjud emas", 400));
      }
      res.status(200).json({
         message: "success",
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const userProfile = catchErrorAsync(async (req, res, next) => {
   try {
      console.log(req.user.id);
      const user = await UserModel.findById(req.user.id);
      res.status(200).json({
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const userProfileC = catchErrorAsync(async (req, res, next) => {
   try {
      console.log(req.user.id);
      const user = await UserModel.findById(req.params.id);
      res.status(200).json({
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const updateUserProfile = catchErrorAsync(async (req, res, next) => {
   try {
      const user = await UserModel.findByIdAndUpdate(req.user._id, req.body);
      if (!user) {
         return next(new AppError("Update bo'lmadi", 400));
      }
      res.status(200).json({
         message: "success",
         user,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const updateUserPassword = catchErrorAsync(async (req, res, next) => {
   const user = await UserModel.findById(req.user._id);

   const comparePassword = await bcrypt.compare(req.body.oldpassword.toString(), user.password);
   if (!comparePassword) {
      return next(new AppError("parol yoki email xato", 400));
   }

   user.password = await bcrypt.hash(req.body.newPassword.toString(), 10);
   await user.save();
   jwtToken(user, 200, res);
});

const BlockUser = catchErrorAsync(async (req, res, next) => {
   try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
         return next(new AppError("bunday user mavjud emas", 400));
      }

      user.isblocked = true;
      await user.save();
      res.status(200).json({ message: "user blocklandi" });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});
const UnBlockUser = catchErrorAsync(async (req, res, next) => {
   try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
         return next(new AppError("bunday user mavjud emas", 400));
      }

      user.isblocked = false;
      await user.save();
      res.status(200).json({ message: "user blockdan ochildi" });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});
// email tasdiqlash tokeni yaratish
const generateVerificationTokenCtrl = catchErrorAsync(async (req, res) => {
   try {
      const user = await UserModel.findById(req.user._id);

      const verificationToken = await user.createAccountVerificationToken();
      await user.save();
      const message = `siz 10 daqiqa ichida emailingizni tasdiqlashingiz kerak <a href="http://localhost:3000/verify-account/${verificationToken}">Tasdiqlash</a> bosing`;
      console.log(verificationToken);
      await sendEmail({
         email: user.email,
         subject: "Email tasdiqlash tokeni",
         message,
      });
      res.json({
         message: `${user.email} ga account tasdiqlash tokeni yuborildi`,
      });
   } catch (error) {
      res.json(error);
   }
});
// account tasdiqlash

const accountVerification = catchErrorAsync(async (req, res, next) => {
   try {
      const { token } = req.body;
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const userFound = await UserModel.findOne({
         accountverificationtoken: hashedToken,
         accountverificationexpired: { $gt: new Date() },
      });
      if (!userFound) {
         return next(new AppError("token vaqti tugadi", 400));
      }

      userFound.isaccountverified = true;
      userFound.accountverificationtoken = undefined;
      userFound.accountverificationexpired = undefined;
      await userFound.save();
      res.status(200).json({
         userFound,
      });
   } catch (error) {
      res.status(500).json({
         message: error.message,
      });
   }
});

const forgotpassword = async (req, res) => {
   try {
      const user = await UserModel.findOne({ email: req.body.email });
      console.log(user);

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "bunday user mavjud emas",
         });
      }

      const resetPasswordToken = user.getResetPasswordToken();

      console.log(resetPasswordToken);
      await user.save();

      const resetPasswordUrl = `${req.protocol}://${req.get(
         "host"
      )}/api/v1/password/reset/${resetPasswordToken}`;

      const message = `sizning  parolingiz  tiklash tokeni ${resetPasswordUrl}`;

      try {
         await sendEmail({
            email: user.email,
            subject: "parolingizni tiklash tokeni",
            message,
         });
         res.status(200).json({
            message: "emailga token yuborildi",
         });
      } catch (error) {
         (user.passwordresettoken = undefined), (user.passwordresetexpires = undefined);
         await user.save({ validateBeforeSave: false });
         res.status(500).json({
            success: false,
            message: error.message,
         });
      }
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};

const resetPassword = async (req, res) => {
   try {
      const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

      //token bo'yicha userni qidirib topish
      const user = await UserModel.findOne({
         passwordresettoken: resetPasswordToken,
         passwordresetexpires: { $gt: Date.now() },
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "token Xatolik mavjud",
         });
      }
      // parolni o'zgartirish

      const hashPassword1 = await bcrypt.hash(req.body.password.toString(), 12);
      user.password = hashPassword1;
      user.passwordresettoken = undefined;
      user.passwordresetexpires = undefined;

      await user.save();
      res.status(200).json({
         success: true,
         message: "parol yangilandi",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message,
      });
   }
};

module.exports = {
   forgotpassword,
   resetPassword,
   generateVerificationTokenCtrl,
   accountVerification,
   UnBlockUser,
   BlockUser,

   updateUserPassword,
   Register,
   login,
   AllUsers,
   DeleteUser,
   SingleUser,
   userProfile,
   updateUserProfile,
   userProfileC,
};
