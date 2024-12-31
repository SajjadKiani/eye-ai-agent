

export const parseTweetsLinks = (url) => {
    try {
        return url.split('status/')[1]
    } catch {
        new Error('invalid link')
    }
}

export const parseListLink = (url) => {
    try {
        return url.split('lists/')[1]
    } catch {
        new Error('invalid link')
    }
}