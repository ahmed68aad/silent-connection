import express from "express";
import auth from "../middleWares/auth.js";
import Group from "../models/groupModel.js";
import Post from "../models/postModel.js";
import { ensureDbConnected } from "./userRoute.js";

const GroupRouter = express.Router();

const createInviteCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const generateUniqueGroupInviteCode = async () => {
  let inviteCode = createInviteCode();
  let exists = await Group.findOne({ inviteCode });

  while (exists) {
    inviteCode = createInviteCode();
    exists = await Group.findOne({ inviteCode });
  }

  return inviteCode;
};

const ensureConnectedCouple = (req, res, next) => {
  if (!req.user?.coupleId) {
    return res.status(400).json({
      success: false,
      message: "You need to connect with your partner before using groups",
    });
  }

  next();
};

const formatGroup = (group, currentCoupleId) => ({
  id: group._id,
  name: group.name,
  description: group.description,
  inviteCode: group.inviteCode,
  ownerCoupleId: group.ownerCoupleId,
  memberCoupleIds: group.memberCoupleIds,
  memberCount: group.memberCoupleIds.length,
  isOwner: group.ownerCoupleId === currentCoupleId,
  createdAt: group.createdAt,
});

GroupRouter.use(ensureDbConnected, auth, ensureConnectedCouple);

GroupRouter.post("/", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    const group = await Group.create({
      name,
      description,
      inviteCode: await generateUniqueGroupInviteCode(),
      ownerCoupleId: req.user.coupleId,
      memberCoupleIds: [req.user.coupleId],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      group: formatGroup(group, req.user.coupleId),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

GroupRouter.get("/", async (req, res) => {
  try {
    const groups = await Group.find({
      memberCoupleIds: req.user.coupleId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      groups: groups.map((group) => formatGroup(group, req.user.coupleId)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

GroupRouter.post("/join", async (req, res) => {
  try {
    const inviteCode = req.body.inviteCode?.trim().toUpperCase();

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: "Invite code is required",
      });
    }

    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Invalid group invite code",
      });
    }

    if (group.memberCoupleIds.includes(req.user.coupleId)) {
      return res.status(400).json({
        success: false,
        message: "Your couple is already in this group",
      });
    }

    group.memberCoupleIds.push(req.user.coupleId);
    await group.save();

    return res.json({
      success: true,
      group: formatGroup(group, req.user.coupleId),
      message: "Joined group successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

GroupRouter.post("/:id/leave", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (!group.memberCoupleIds.includes(req.user.coupleId)) {
      return res.status(403).json({
        success: false,
        message: "Your couple is not a member of this group",
      });
    }

    if (group.ownerCoupleId === req.user.coupleId) {
      return res.status(400).json({
        success: false,
        message: "Group owner cannot leave the group",
      });
    }

    group.memberCoupleIds = group.memberCoupleIds.filter(
      (coupleId) => coupleId !== req.user.coupleId,
    );
    await group.save();

    return res.json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

GroupRouter.post("/:id/transfer-ownership", async (req, res) => {
  try {
    const targetCoupleId = req.body.targetCoupleId?.trim();
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.ownerCoupleId !== req.user.coupleId) {
      return res.status(403).json({
        success: false,
        message: "Only the group owner can transfer ownership",
      });
    }

    if (!targetCoupleId) {
      return res.status(400).json({
        success: false,
        message: "targetCoupleId is required",
      });
    }

    if (targetCoupleId === req.user.coupleId) {
      return res.status(400).json({
        success: false,
        message: "You already own this group",
      });
    }

    if (!group.memberCoupleIds.includes(targetCoupleId)) {
      return res.status(400).json({
        success: false,
        message: "The selected couple is not a member of this group",
      });
    }

    group.ownerCoupleId = targetCoupleId;
    await group.save();

    return res.json({
      success: true,
      message: "Ownership transferred successfully",
      group: formatGroup(group, req.user.coupleId),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

GroupRouter.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (group.ownerCoupleId !== req.user.coupleId) {
      return res.status(403).json({
        success: false,
        message: "Only the group owner can delete this group",
      });
    }

    await Promise.all([
      Post.deleteMany({ audience: "group", groupId: group._id }),
      group.deleteOne(),
    ]);

    return res.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default GroupRouter;
