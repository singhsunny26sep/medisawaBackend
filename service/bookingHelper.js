const moment = require("moment");


// Function to generate time slots
exports.generateTimeSlots = (start, end, interval) => {
    let startTime = moment(start, 'HH:mm');
    let endTime = moment(end, 'HH:mm');
    let slots = [];

    while (startTime.isBefore(endTime)) {
        slots.push(startTime.format('HH:mm'));
        startTime.add(interval, 'minutes');
    }

    return slots;
};

const generateTimeSlots1 = (start, end, interval) => {
    let slots = [];
    let currentTime = new Date(`2000-01-01T${start}`);
    let endTimeObj = new Date(`2000-01-01T${end}`);

    while (currentTime < endTimeObj) {
        let slot = currentTime.toTimeString().slice(0, 5); // Format HH:MM
        slots.push(slot);
        currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
    return slots;
};


exports.TimeFormate = (time) => {
    return moment(time, "HH:mm").format("hh:mm A") // Convert to 12-hour format};
}