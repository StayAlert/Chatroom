const moment = require('moment')

fotmatMessage = (username,text) => {
    return {
        username,
        text,
        time: moment().format('h:mm a')
    }
}

module.exports = fotmatMessage