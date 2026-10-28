console.log("JavaScript connected");

/* ===== Dark mode ===== */
const themeButton = document.getElementById("themeToggle");

function setTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    themeButton.textContent = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
    try {
        localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (e) {}
}

try {
    if (localStorage.getItem("theme") === "dark") {
        setTheme(true);
    }
} catch (e) {}

themeButton.addEventListener("click", function () {
    setTheme(!document.body.classList.contains("dark-mode"));
});

/* ===== Project filters ===== */
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const projectsEmpty = document.getElementById("projectsEmpty");

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selected = button.getAttribute("data-filter");

        filterButtons.forEach(function (otherButton) {
            otherButton.classList.remove("is-active");
            otherButton.setAttribute("aria-pressed", "false");
        });

        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");

        let visibleCount = 0;

        projectCards.forEach(function (card) {
            const language = card.getAttribute("data-language");
            const shouldShow = selected === "all" || language === selected;
            card.hidden = !shouldShow;
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        projectsEmpty.hidden = visibleCount !== 0;
    });
});

/* ===== Weather ===== */
const cityInput = document.getElementById("cityInput");
const weatherButton = document.getElementById("weatherButton");
const weatherResult = document.getElementById("weatherResult");

weatherButton.addEventListener("click", getWeather);

async function getWeather() {

    const city = cityInput.value.trim();

    if (!city) {
        weatherResult.textContent = "Please enter a city.";
        return;
    }

    weatherResult.textContent = "Loading weather...";

    // Paste YOUR OpenWeatherMap API key here (keep the quotes)
    const apiKey = "7c5f8767476d2cc85e9638fdb22ab6c6";

    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        weatherResult.innerHTML = `
            <h3>${data.name}</h3>
            <p>Temperature: ${data.main.temp}°C</p>
            <p>Condition: ${data.weather[0].description}</p>
        `;

    } catch (error) {

        weatherResult.textContent =
            "Unable to fetch weather. Please try again.";

        console.error(error);
    }
}

/* ===== Interactive design ===== */

// Scroll progress bar + back to top button
const progressBar = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");

function onScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = percent + "%";
    backToTop.classList.toggle("show", window.scrollY > 300);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Fade-in on scroll + active menu link
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll("section, .project-card, .site-footer").forEach(function (el) {
        el.classList.add("reveal");
        revealObserver.observe(el);
    });

    const navLinks = document.querySelectorAll('.site-header nav a[href^="#"]');
    const linkMap = {};

    navLinks.forEach(function (link) {
        linkMap[link.getAttribute("href").slice(1)] = link;
    });

    const spyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                navLinks.forEach(function (l) { l.classList.remove("active"); });
                const link = linkMap[entry.target.id];
                if (link) {
                    link.classList.add("active");
                }
            }
        });
    }, { rootMargin: "-40% 0px -55% 0px" });

    Object.keys(linkMap).forEach(function (id) {
        const section = document.getElementById(id);
        if (section) {
            spyObserver.observe(section);
        }
    });
}

/* ===== Tech particle background ===== */
const techCanvas = document.getElementById("techCanvas");

if (techCanvas) {
    const ctx = techCanvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles = [];

    function resizeCanvas() {
        techCanvas.width = window.innerWidth;
        techCanvas.height = window.innerHeight;
        const count = Math.min(70, Math.floor(window.innerWidth / 20));
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * techCanvas.width,
                y: Math.random() * techCanvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, techCanvas.width, techCanvas.height);

        const dark = document.body.classList.contains("dark-mode");
        const rgb = dark ? "0, 200, 255" : "10, 37, 64";

        particles.forEach(function (p, i) {
            if (!reduceMotion) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > techCanvas.width) { p.vx *= -1; }
                if (p.y < 0 || p.y > techCanvas.height) { p.vy *= -1; }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + rgb + ", 0.55)";
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dist = Math.hypot(p.x - q.x, p.y - q.y);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = "rgba(" + rgb + ", " + (0.18 * (1 - dist / 120)) + ")";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        });

        if (!reduceMotion) {
            requestAnimationFrame(drawParticles);
        }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    drawParticles();
}
