import mongoose, { Document, Schema } from "mongoose";

export interface IReply {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: "client" | "agent" | "admin";
  content: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
}

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderEmail: string;
  senderRole: "client" | "agent" | "admin";
  subject: string;
  content: string;
  status: "pending" | "accepted" | "resolved" | "closed";
  assignedTo?: mongoose.Types.ObjectId;
  assignedToName?: string;
  acceptedAt?: Date;
  attachments?: string[];
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
  isEdited?: boolean;
}

const ReplySchema = new Schema<IReply>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["client", "agent", "admin"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["client", "agent", "admin"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "resolved", "closed"],
      default: "pending",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedToName: {
      type: String,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    attachments: {
      type: [String],
      default: [],
    },
    replies: {
      type: [ReplySchema],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ assignedTo: 1, status: 1 });
MessageSchema.index({ status: 1, createdAt: -1 });

export const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
