const today = new Date()

module.exports.getDate = () => {
    var options = { weekday: 'long', month: 'long', day: 'numeric' };
    const currentDay = today.toLocaleDateString("en-US", options);
    return currentDay
}

module.exports.getDay = () => {
    var options = { weekday: 'long' };
    var currentDay = today.toLocaleDateString("en-US", options);
    return currentDay
}