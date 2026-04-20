import mongoose from "mongoose";

const postViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    firstViewedAt: {
      type: Date,
      default: Date.now,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
    sessionIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const authorOpenSchema = new mongoose.Schema(
  {
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastOpenedAt: {
      type: Date,
      default: null,
    },
    sessionIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coupleId: {
    type: String,
    default: null,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  audience: {
    type: String,
    enum: ["couple", "group"],
    default: "couple",
  },
  seenBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  viewStats: {
    type: [postViewSchema],
    default: [],
  },
  authorOpenStats: {
    type: authorOpenSchema,
    default: () => ({
      count: 0,
      lastOpenedAt: null,
    }),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ coupleId: 1, createdAt: -1 });
postSchema.index({ groupId: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
