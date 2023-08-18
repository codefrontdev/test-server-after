const mongoose = require("mongoose");
const Inventory = require("../models/inventoryModel");
const Users = require("../models/userModel");

exports.createInventoryController = async (req, res) => {
  try {
    const { email } = req.body;
    // validation
    const user = await Users.findOne({ email });

    if (!user) {
      throw new Error("User not Found");
    }

    // if (inventoryType === 'in' && user.role !== 'donar') {
    //     throw new Error('Not a donar account')
    // }

    // if (inventoryType === 'out' && user.role !== 'hospital') {
    //     throw new Error('Not a hospital')
    // }

    if (req.body.inventoryType == "out") {
      const requestedBloodGroup = req.body.bloodGroup;
      const requestedQuantityOfBlood = req.body.quantity;
      const organisation = new mongoose.Types.ObjectId(req.body.userId);

      // calculate Blood Quantity
      const totalInOfRequestedBlood = await Inventory.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup
          }
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" }
          }
        }
      ]);
      // console.log('Total In', totalInOfRequestedBlood);
      const totalIn = totalInOfRequestedBlood[0]?.total || 0;
      // calculate OUT Blood Quantity
      const totalOutOfRequestedBloodGroup = await Inventory.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
            bloodGroup: requestedBloodGroup
          }
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" }
          }
        }
      ]);
      const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

      // in & Out Calc
      const availableQuantityOfBloodGroup = totalIn - totalOut;
      // quantity validation
      if (availableQuantityOfBloodGroup < requestedQuantityOfBlood) {
        return res.status(500).send({
          success: false,
          message: `Only ${availableQuantityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`
        });
      }
      req.body.hospital = user?._id;
    } else {
      req.body.donar = user?._id;
    }

    // save record
    const inventory = new Inventory(req.body);
    await inventory.save();
    return res.status(201).send({
      success: true,
      message: "New Boold Record Added"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Create Inventory API",
      error
    });
  }
};

// GET ALL BLOOD RECORDS
exports.getInventoryController = async (req, res) => {
  try {
    const inventory = await Inventory.find({ organisation: req.body.userId })
      .populate("donar")
      .populate("hospital")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "Get All Records successfully",
      inventory
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get All Inventory",
      error
    });
  }
};

// GET DONAR RECORDS
exports.getDonarsController = async (req, res) => {
  try {
    const organisation = req.body.userId;

    // fond donars
    const donarId = await Inventory.distinct("donar", {
      organisation
    });

    // console.log(donarId)
    const donars = await Users.find({ _id: { $in: donarId } });

    return res.status(200).send({
      success: true,
      message: "Donar Record Fetched Successfully",
      donars
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donar recordes",
      error
    });
  }
};

exports.getHospitalsController = async (req, res) => {
  try {
    const organisation = req.body.userId;

    // GET HOSPITAL ID
    const hospitalId = await Inventory.distinct("hospital", { organisation });

    // FIND HOSPITAL
    const hospitals = await Users.find({
      _id: { $in: hospitalId }
    });

    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In get Hospital API",
      error
    });
  }
};

exports.getOrganisationController = async (req, res) => {
  try {
    const donar = req.body.userId;
    const orgId = await Inventory.distinct("organisation", { donar });

    // find org
    const organisations = await Users.find({
      _id: { $in: orgId }
    });

    return res.status(200).send({
      success: true,
      message: "Org Data Fetched Successfully",
      organisations
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG API",
      error
    });
  }
};
