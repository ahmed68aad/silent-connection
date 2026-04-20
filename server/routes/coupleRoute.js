import express from "express";
import auth from "../middleWares/auth.js";
import User from "../models/userModel.js";

const CoupleRouter = express.Router();

CoupleRouter.post("/connect", auth, async (req, res) => {
  try {
    const normalizedInviteCode = req.body.inviteCode?.trim().toUpperCase();

    if (!normalizedInviteCode) {
      return res.status(400).json({
        success: false,
        message: "Invite code is required",
      });
    }

    const partner = await User.findOne({ inviteCode: normalizedInviteCode });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite code",
      });
    }

    if (partner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    if (req.user.coupleId || partner.coupleId) {
      return res.status(400).json({
        success: false,
        message: "Already connected",
      });
    }

    const coupleId = Date.now().toString();

    await User.findByIdAndUpdate(req.user._id, { coupleId });
    await User.findByIdAndUpdate(partner._id, { coupleId });

    return res.status(200).json({
      success: true,
      message: "Connected successfully",
      coupleId,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        profileImage: partner.profileImage || "",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

CoupleRouter.get("/status", auth, async (req, res) => {
  try {
    if (!req.user.coupleId) {
      return res.json({
        success: true,
        connected: false,
        coupleId: null,
        partner: null,
      });
    }

    const partner = await User.findOne({
      coupleId: req.user.coupleId,
      _id: { $ne: req.user._id },
    }).select("name email inviteCode profileImage");

    return res.json({
      success: true,
      connected: true,
      coupleId: req.user.coupleId,
      partner: partner
        ? {
            id: partner._id,
            name: partner.name,
            email: partner.email,
            profileImage: partner.profileImage || "",
            inviteCode: partner.inviteCode,
          }
        : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

CoupleRouter.post("/disconnect", auth, async (req, res) => {
  try {
    if (!req.user.coupleId) {
      return res.status(400).json({
        success: false,
        message: "You are not connected to anyone",
      });
    }

    await User.updateMany(
      { coupleId: req.user.coupleId },
      { $set: { coupleId: null } },
    );

    return res.json({
      success: true,
      message: "Disconnected successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default CoupleRouter;
