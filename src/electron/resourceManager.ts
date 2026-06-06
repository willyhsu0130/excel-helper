import osUtils from "os-utils"

const POLLING_INTERVAL = 500;

export const pollResource = () => {
    setInterval(async () => {
        const cpuUsage = await getCpuUsage()
        const ramUsage = getRamUsage();
        console.log({ cpuUsage, ramUsage })
    }, POLLING_INTERVAL)
}

const getCpuUsage = () => {
    return new Promise(resolve => {
        osUtils.cpuUsage(resolve)
    })
}

const getRamUsage = () => {
    return 1 - osUtils.freememPercentage()
}