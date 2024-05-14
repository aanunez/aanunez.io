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

const precalc = "0,100 20,96 40,93 60,86 80,100 100,93 120,100 140,93 160,90 180,93 200,73 220,80 240,90 260,73 280,66 300,80 320,96 340,96 360,86 380,66 400,93 420,90 440,93 460,93 480,93 500,86 520,100 540,100 560,100 580,50"
const ghline = document.getElementById("ghline") as HTMLElement
ghline.setAttribute("points", precalc)