import './style.css'
import line from './plot.json'

const email = document.getElementById("email") as HTMLElement
email.setAttribute("href", "mailto:adam.a.nunez@gmail.com")

const linkedin = document.getElementById("linkedin") as HTMLElement
linkedin.setAttribute("href", "https://www.linkedin.com/in/adam-a-nunez/")

const github = document.getElementById("github") as HTMLElement
github.setAttribute("href", "https://github.com/aanunez/");

const emrepo = document.getElementById("emrepo") as HTMLElement
emrepo.setAttribute("href", "https://redcap.vanderbilt.edu/consortium/modules/index.php")

const uwctri = document.getElementById("uwctri") as HTMLElement
uwctri.setAttribute("href", "https://github.com/uwctri")

const ghline = document.getElementById("ghline") as HTMLElement
ghline.setAttribute("points", line.data)