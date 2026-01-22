
const isDevMode = () => {
    return process.env.PROJECT_ENV?.toLocaleLowerCase() === "dev"
}

const YES = 'YES'
const NO = 'NO'

module.exports = {
    isDevMode,
    YES,
    NO
}