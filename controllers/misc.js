module.exports = {
    timeout: time => new Promise(resolve => setTimeout(resolve, time))
}