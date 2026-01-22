const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    /**
     * 🔗 Academic context
     */
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
      index: true,
    },

    /**
     * 📌 Topic identity
     */
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Loops", "Pointers"
    },

    /**
     * 🧠 Optional metadata
     * Can help in quiz balancing
     */
    weight: {
      type: Number,
      default: 1, // higher = more important
    },

    description: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/**
 * 🚫 Prevent duplicate topic names within a unit
 */
topicSchema.index({ unitId: 1, name: 1 }, { unique: true });

const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);

module.exports = Topic;
