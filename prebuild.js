fs = require('node:fs')
const token = process.env.GITHUB_TOKEN
const user = "aanunez"
const size = 100
const search = "https://api.github.com/search/commits?q="

let page = 1
let total = 9999
let history = new Proxy({}, {
    get: function (target, name) {
        return target.hasOwnProperty(name) ? target[name] : 0
    }
})

let today = new Date()
let date = new Date(new Date().setDate(today.getDate() - 30 - 1))
let ymd = date.toISOString().split('T')[0]
    ;
(async () => {
    while ((size * page) <= (Math.ceil(total / size) * size)) {
        await fetch(`${search}author:${user}+author-date:>${ymd}&per_page=${size}&page=${page}`, {
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": `Bearer ${token}`,
                "X-GitHub-Api-Version": "2022-11-28"
            }
        }).then(res => res.json()).then(data => {
            total = data.total_count
            for (entry of data.items) {
                history[entry.commit.author.date.split("T")[0]] += 1
            }
            page += 1
        })
    }

    let scale = 100 / Math.max(...Object.values(history))
    let svgplot = []
    let score = 0
    let count = 0
    while (count <= 30) {
        date = (new Date(new Date(date).setDate(date.getDate() + 1)))
        ymd = date.toISOString().split('T')[0]
        score = Math.floor(100 - (history[ymd] * scale))
        svgplot.push(`${20 * count},${score}`)
        count += 1
    }

    try {
        fs.writeFileSync("plot.json", JSON.stringify({
            data: svgplot.join(" ")
        }))
    } catch (err) {
        console.error(err)
    }
})()