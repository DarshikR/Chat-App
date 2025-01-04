import User from "../models/user.model.js"
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Fetch all users except the logged-in user
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password").lean();

        // Add the last message for each user
        const usersWithLastMessage = await Promise.all(
            users.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: user._id, receiverId: loggedInUserId },
                        { senderId: loggedInUserId, receiverId: user._id }
                    ]
                }).sort({ createdAt: -1 }); // Get the last message between the logged-in user and the other user

                return {
                    ...user,
                    lastMessage: lastMessage || null // Include the full lastMessage object or null
                };
            })
        );

        res.status(200).json(usersWithLastMessage);
    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.message(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const imageSizeInKB = (image.length * (3 / 4)) / 1024; // Base64 size calculation
            if (imageSizeInKB > 5000) { // 5MB limit
                return res.status(400).json({ error: "Image size exceeds 5MB limit" });
            }

            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};