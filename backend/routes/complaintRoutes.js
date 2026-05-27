const express = require("express");

const router = express.Router();

const Complaint =
  require("../models/Complaint");

const multer = require("multer");

const cloudinary =
  require("cloudinary").v2;


// CLOUDINARY CONFIG

cloudinary.config({

  cloud_name:
    process.env.CLOUD_NAME,

  api_key:
    process.env.API_KEY,

  api_secret:
    process.env.API_SECRET

});


// MULTER

const storage =
  multer.memoryStorage();

const upload =
  multer({
    storage: storage
  });


// GET ALL COMPLAINTS

router.get("/", async (req, res) => {

  try {

    const complaints =
      await Complaint.find()
      .sort({ createdAt: -1 });

    res.json(complaints);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// REPORT COMPLAINT

router.post(

  "/report",

  upload.single("image"),

  async (req, res) => {

    try {

      const {

        name,

        pollutionType,

        location,

        description

      } = req.body;

      let imageUrl = "";

      // IMAGE UPLOAD

      if (req.file) {

        const fileBase64 =
          req.file.buffer.toString(
            "base64"
          );

        const file =
          `data:${req.file.mimetype};base64,${fileBase64}`;

        const uploadedResponse =
          await cloudinary.uploader.upload(
            file,
            {
              folder:
                "greenreport"
            }
          );

        imageUrl =
          uploadedResponse.secure_url;

      }

      // SAVE COMPLAINT

      const complaint =
        new Complaint({

          name,

          pollutionType,

          location,

          description,

          image: imageUrl,

          status: "Pending"

        });

      await complaint.save();

      res.status(201).json({

        message:
          "Complaint Submitted Successfully"

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Server Error"

      });

    }

  }

);


// RESOLVE COMPLAINT

router.put("/:id", async (req, res) => {

  try {

    const updatedComplaint =
      await Complaint.findByIdAndUpdate(

        req.params.id,

        {
          status: "Resolved"
        },

        {
          new: true
        }

      );

    res.json(updatedComplaint);

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

});


// DELETE COMPLAINT

router.delete("/:id", async (req, res) => {

  try {

    await Complaint.findByIdAndDelete(
      req.params.id
    );

    res.json({

      message:
        "Complaint Deleted Successfully"

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

});


module.exports = router;