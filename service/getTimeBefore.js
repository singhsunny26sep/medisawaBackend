const moment = require('moment');

exports.canBookAppointment = (appointmentDate, appointmentTime, doctor) => {
    const appointmentDateTime = moment(`${appointmentDate} ${appointmentTime}`, "YYYY-MM-DD HH:mm");
    const doctorEndTime = doctor.endTime ? moment(`${appointmentDate} ${doctor.endTime}`, "YYYY-MM-DD HH:mm") : null;
    const bookingBeforeTime = doctor.bookingBeforeTime || 0; // Default to 0 if null

    // Calculate the latest possible booking time
    const latestBookingTime = doctorEndTime ? doctorEndTime.clone().subtract(bookingBeforeTime, 'hours') : null;

    if (latestBookingTime && appointmentDateTime.isAfter(latestBookingTime)) {
        return false; // Cannot book because it's beyond the allowed booking time
    }
    return true;
};