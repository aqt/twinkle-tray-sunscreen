import config from './config.js'
import fs from 'fs'
import { start } from './background.js'

main()

function main() {
    checkUserConfiguration()
    start()
}

/**
 * Make sure user configuration is correct enough
 */
function checkUserConfiguration() {
    function exit () {
        console.error(...arguments)
        process.exit(1)
    }

    if (!fs.existsSync(config.binary)) {
        exit('config.binary does not exist:', config.binary)
    }

    if (!config.hasOwnProperty('coordinates')) {
        exit('config.coordinates is required. See example file')
    }

    if (!config.hasOwnProperty('brightness')) {
        exit('config.brightness is required. See example file')
    }
}
