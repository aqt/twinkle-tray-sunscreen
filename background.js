import config from './config.js'
import suncalc from 'suncalc'
import { execFileSync } from 'child_process'

const UPDATE_TIMER = 1000 * 60 * 5 // 5 minutes in milliseconds

let startup = true
let sunTimes
let nextTimeIndex
let nextTime

function handleUpdate() {
    if (sunTimes === undefined) {
        const now = new Date()
        const lat = config.coordinates.latitude
        const long = config.coordinates.longitude

        console.log('New calculation at ' + now.toISOString())
        sunTimes = getSunTimes(now, lat, long)

        const last = sunTimes[sunTimes.length - 1]

        // If the last time of the day has already passed we'll get sun times
        // for the next day instead
        if (last[1] < now) {
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            sunTimes = getSunTimes(tomorrow, lat, long)
        }

        nextTimeIndex = findIndexOfNextTime(now, sunTimes)
        nextTime = sunTimes[nextTimeIndex]

        console.log('Sun times calculated', sunTimes)

        // Adjust brightness according to most recently passed time on startup
        if (startup) {
            startup = false

            let name

            if (nextTimeIndex === 0) {
                name = sunTimes[sunTimes.length - 1][0]
            } else {
                name = sunTimes[nextTimeIndex - 1][0]
            }

            const brightness = config.brightness[name]

            console.log('Startup handling of previous occurence', name)
            const result = setBrightness(brightness)
            console.log('Setting brightness to', brightness, " Result:", result)
        }

        console.log('Waiting for', ...nextTime)
    }

    if (new Date() < nextTime[1]) {
        return
    }

    const brightness = config.brightness[nextTime[0]]

    console.log('Handling', nextTime[0])
    const result = setBrightness(brightness)
    console.log('Setting brightness to', brightness, " Result:", result)

    nextTimeIndex++

    if (nextTimeIndex >= sunTimes.length) {
        console.log('Last entry passed')
        sunTimes = undefined // Update times next run
    } else {
        nextTime = sunTimes[nextTimeIndex]
        console.log('Waiting for', ...nextTime)
    }
}

/**
 * Get sun times for the given parameters.  Times not configured by the user
 * will be skipped
 * @param {Date} time time
 * @param {Number} lat latitude
 * @param {Number} long longitude
 * @returns Array containing pairs of sun period names and times, sorted by time
 */
function getSunTimes(time, lat, long) {
    let times = suncalc.getTimes(time, lat, long)

    for (const prop of Object.keys(times)) {
        if (!config.brightness.hasOwnProperty(prop)) {
            delete times[prop]
        } else if (isNaN(times[prop])) {
            // Object will contain invalid dates if the event time cannot be calculated.
            // For example 'nauticalDawn' may not occur in high-latitude summer.
            console.warn(`${prop} is configured but does not occur in the current period`)
            delete times[prop]
        }
    }

    times = Object.entries(times)
    times.sort((l, r) => l[1] - r[1])

    return times
}

/**
 * Find the next time in the given sun times
 * @param {Date} times Time to compare against
 * @param {Array} sunTimes Time sorted array of sun times
 * @returns An index in sunTimes, undefined if all are in the past
 */
function findIndexOfNextTime(time, sunTimes) {
    for (let i = 0; i < sunTimes.length; i++) {
        const t = sunTimes[i]

        if (t[1] > time) {
            return i
        }
    }
}

/**
 * Set brightness of all monitors using Twinkle Tray CLI
 * @param {Number} brightness Brightness 0 - 100
 */
export function setBrightness(brightness) {
    const args = ['--all', '--set=' + brightness]
    const output = execFileSync(config.binary, args)
    return output.toString().trim()
}

export function start() {
    setInterval(handleUpdate, UPDATE_TIMER)
    handleUpdate()
}
