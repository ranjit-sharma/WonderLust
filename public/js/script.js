// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})


document.querySelectorAll(".temporary-alert").forEach((alert) => {
    window.setTimeout(() => {
        if (window.bootstrap && window.bootstrap.Alert) {
            window.bootstrap.Alert.getOrCreateInstance(alert).close();
        } else {
            alert.remove();
        }
    }, 5000);
});


const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

if (themeToggle) {
    const themeIcon = themeToggle.querySelector("i");
    const themeLabel = themeToggle.querySelector("span");

    const updateThemeButton = () => {
        const isDarkMode = document.body.classList.contains("dark-mode");
        themeIcon.className = isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon";
        const label = isDarkMode ? "Light mode" : "Dark mode";
        themeToggle.setAttribute("aria-label", isDarkMode ? "Switch to light mode" : "Switch to dark mode");
        if (themeLabel) {
            themeLabel.textContent = label;
        }
    };

    updateThemeButton();

    themeToggle.addEventListener("click", () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        const theme = isDarkMode ? "dark" : "light";
        localStorage.setItem("theme", theme);
        window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
        updateThemeButton();
    });
}


// for Tax switch in the home page
let taxSwitch =
    document.getElementById("flexSwitchCheckDefault");
if (taxSwitch) {
taxSwitch.addEventListener("click", () => {
    let taxInfo = document.getElementsByClassName("tax-info");
    for (info of taxInfo) {
        if (info.style.display != "inline") {
            info.style.display = "inline";
        } else {
            info.style.display = "none";
        }
    }
});
}

// Price range dual slider
const sliderMin     = document.getElementById("slider-min");
const sliderMax     = document.getElementById("slider-max");
const rangeEl       = document.getElementById("price-slider-range");
const minDisplay    = document.getElementById("price-min-display");
const maxDisplay    = document.getElementById("price-max-display");
const minInput      = document.getElementById("minPrice-input");
const maxInput      = document.getElementById("maxPrice-input");

function updateSlider() {
    if (!sliderMin) return;
    const min = parseInt(sliderMin.value);
    const max = parseInt(sliderMax.value);
    const rangeMax = parseInt(sliderMin.max);

    if (min > max) { sliderMin.value = max; return updateSlider(); }

    const leftPct  = (min / rangeMax) * 100;
    const rightPct = (max / rangeMax) * 100;

    rangeEl.style.left  = leftPct + "%";
    rangeEl.style.width = (rightPct - leftPct) + "%";

    minDisplay.textContent = min.toLocaleString("en-IN");
    maxDisplay.textContent = max.toLocaleString("en-IN");

    minInput.value = min > 0     ? min : "";
    maxInput.value = max < rangeMax ? max : "";
}

if (sliderMin) {
    sliderMin.addEventListener("input", updateSlider);
    sliderMax.addEventListener("input", updateSlider);
    updateSlider();
}
