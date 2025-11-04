import Message from "../models/message.js";

// @desc Send message
export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

// @desc Get messages between users
export const getMessages = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender receiver", "name email");

    res.json(messages);
  } catch (err) {
    next(err);
  }
};
