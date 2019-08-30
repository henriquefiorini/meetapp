import mongoose, { Schema } from 'mongoose';

const notificationTypes = ['SUBSCRIPTION.NEW', 'SUBSCRIPTION.CANCELED'];

const notificationSchema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: notificationTypes,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    clickedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
