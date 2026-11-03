const links = {
  email: "mailto:adam.a.nunez@gmail.com",
  linkedin: "https://www.linkedin.com/in/adam-a-nunez/",
  github: "https://github.com/aanunez/",
  emrepo: "https://redcap.vanderbilt.edu/consortium/modules/index.php",
  uwctri: "https://github.com/uwctri",
};

for (const [id, href] of Object.entries(links)) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("href", href);
}

const ghline = document.getElementById("ghline");
if (ghline && !ghline.getAttribute("points")) {
  fetch("/plot.json")
    .then((res) => res.json())
    .then((plot) => {
      if (plot?.data) ghline.setAttribute("points", plot.data);
    })
    .catch(() => {});
}

