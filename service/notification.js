const admin = require('firebase-admin');
const serviceAccount = require('../medisewa-e71de-firebase-adminsdk.json');
const Notification = require('../model/Notification');
const User = require('../model/User');
const { TimeFormate } = require('./bookingHelper');
const mongoose = require('mongoose');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://<your-project-id>.firebaseio.com",
})


exports.sendSingleNotification = async (userId, name, description, senderId, type) => {
    //user id means reciever id
    // console.log("userId", userId);
    // console.log("name", name);
    // console.log("description", description);
    // console.log("senderId", senderId);
    // console.log("type", type);


    let admin1;
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
        admin1 = await User.findOne({ role: 'admin' })
    }

    const user = await User.findById(userId)
    const result = Notification.create({ receiverId: userId, title: name, message: description, senderId: senderId ? senderId : admin1?._id, type });
    console.log("result: ", result);

    const message = {
        token: user.fcmToken,
        notification: {
            title: name,
            body: description,
        },
    };

    // user.notifications.push(tempDoc?._id);

    // await user.save();

    // await tempDoc.save()

    await admin.messaging().send(message);
}

exports.sendMultipleNotification = async (name, description, senderId, type) => {

    const users = await User.find();

    const tokens = users.map(user => user.fcmToken).filter(token => token);

    const message = {
        tokens, // List of tokens for multiple users
        notification: {
            title: name,
            body: description,
        },
    };
    // Send notifications to multiple users
    // const response = await admin.messaging().sendMulticast(message);
    const response = await admin.messaging().sendEachForMulticast(message);
    // Save notification history in the Notification schema
    // receiverId: userId, title: name, message: description, senderId 
    const notificationDocs = users.map(user => ({
        receiverId: user._id,
        title: name,
        message: description,
        senderId,
        type
    }));
    await Notification.insertMany(notificationDocs);

    return response
}

exports.bookingNotification = async (doctorId, patientId, bookingDate, bookingTime) => {
    try {
        const doctor = await User.findById(doctorId);
        const patient = await User.findById(patientId);

        if (!doctor?.fcmToken) {
            return "No fcm token in doctor!"
        }
        if (!patient?.fcmToken) {
            return "No fcm token in patient!"
        }
        await this.sendSingleNotification(doctorId, "New Booking", `New booking for ${patient.name} on ${bookingDate} at ${TimeFormate(bookingTime)}`, patientId, "booking")
        await this.sendSingleNotification(patientId, "Booking Confirmed", `you booking confirm for ${patient?.name} to ${doctor?.name} on ${bookingDate} at ${TimeFormate(bookingTime)}`, doctorId, "booking")

    } catch (error) {
        console.log("error on bookgin notification: ", error);
        throw new Error("bookingNotification error")
    }
}

exports.bookingCancelNotification = async (cancelUserId, booking) => {
    try {
        const user = await User.findById(cancelUserId);
        // const patient = await User.findById(patientId);
        let role
        if (user.role == 'doctor') {
            await this.sendSingleNotification(booking?.patientId, "Booking Cancelled", `Booking for ${patient.name} on ${bookingDate} at ${TimeFormate(bookingTime)} has been cancelled`, cancelUserId, "booking")
        } else if (user.role == 'patient') {
            await this.sendSingleNotification(booking?.doctorId, "Booking Cancelled", `Booking for ${patient?.name} on ${bookingDate} at ${TimeFormate(bookingTime)} has been cancelled`, cancelUserId, "booking")
            // role = "Patient"
            // await sendSingleNotification(booking?.doctorId, "Booking Cancelled", `Booking for ${patient.name} on ${bookingDate} at ${TimeFormate(bookingTime)} has been cancelled`, cancelUserId, "booking")
        } else {

        }

        // await sendSingleNotification(cancelUserId, "New Booking", `New booking for ${patient.name} on ${bookingDate} at ${TimeFormate(bookingTime)}`, patientId, "booking")
        // await sendSingleNotification(patientId, "Booking Confirmed", `you booking confirm for ${patient?.name} to ${doctor?.name} on ${bookingDate} at ${TimeFormate(bookingTime)}`, doctorId, "booking")

    } catch (error) {
        throw new Error("bookingNotification error")
    }
}