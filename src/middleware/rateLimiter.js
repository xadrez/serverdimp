import ratelimit from '../lib/upstash.js'

const rateLimiter = async (req, res, next) => {
    try {
        const { success } = await ratelimit.limit("my-rate-limit")

        if (!success) {
            return res.status(429).json({
                message: "Too may atempts, please try again in 60 min"
            })
        }

        next()
    } catch (error) {
        console.log(
            "Rate limit error", error
        )
        next(error)
    }
}

export default rateLimiter