const express = require("express");

const router = express.Router();

const Complaint = require("../models/Complaint");

const multer = require("multer");

const cloudinary =
require("../config/cloudinary");


// MULTER STORAGE

const storage = multer.diskStorage({});

const upload = multer({
    storage
});


// POST COMPLAINT WITH IMAGE

router.post(
    "/report",
    upload.single("image"),
    async (req, res) => {

        try {

            let imageUrl = "";

            // UPLOAD IMAGE TO CLOUDINARY

            if (req.file) {

                const result =
                    await cloudinary.uploader.upload(
                        req.file.path
                    );

                imageUrl =
                    result.secure_url;

            }

            // SAVE COMPLAINT

            const newComplaint =
                new Complaint({

                    name: req.body.name,

                    pollutionType:
                        req.body.pollutionType,

                    location:
                        req.body.location,

                    description:
                        req.body.description,

                    image: imageUrl

                });

            await newComplaint.save();

            res.status(201).json({
                message:
                    "Complaint Submitted Successfully ✅"
            });

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }

    }
);


// GET ALL COMPLAINTS

router.get("/", async (req, res) => {

    try {

        const complaints =
            await Complaint.find();

        res.status(200).json(
            complaints
        );

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// UPDATE COMPLAINT STATUS

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

        res.status(200).json(
            updatedComplaint
        );

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// DELETE COMPLAINT

router.delete("/:id", async (req, res) => {

    try {

        await Complaint.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message:
                "Complaint Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


module.exports = router;