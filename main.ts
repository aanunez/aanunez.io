import './style.css'

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



const precalc = "0,100 20,86 40,100 60,93 80,100 100,93 120,90 140,93 160,73 180,80 200,90 220,73 240,66 260,80 280,96 300,96 320,86 340,66 360,93 380,90 400,93 420,93 440,93 460,86 480,100 500,100 520,100 540,50 560,80 580,96"
const ghline = document.getElementById("ghline") as HTMLElement
ghline.setAttribute("points", precalc)