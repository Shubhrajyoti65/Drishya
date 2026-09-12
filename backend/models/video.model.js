import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudnary URL
      required: true,
    },
    thumbnail: {
      type: String, // cloudnary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "MEMBERS_ONLY", "TIER_ONLY"],
      default: "PUBLIC",
    },
    minimumTier: {
      type: Schema.Types.ObjectId,
      ref: "MembershipTier",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);
