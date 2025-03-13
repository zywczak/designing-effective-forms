let clickCount = 0;

const countryInput = document.getElementById('countryList');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');

// Licznik kliknięć
function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

document.addEventListener('click', handleClick);

document.addEventListener("DOMContentLoaded", function () {
    fetchAndFillCountries();
    getCountryByIP();
    initializeVatToggle();
});

// Pobieranie listy krajów
async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) throw new Error('Błąd pobierania danych');
        
        const data = await response.json();
        const countries = data.map(country => country.name.common);
        countryInput.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

// Pobieranie kraju użytkownika na podstawie IP
function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            const countryInput = document.getElementById("country");

            if (countryInput) {
                countryInput.value = country;
                countryInput.dispatchEvent(new Event('input'));
            }
            getCountryCode(country);
        })
        .catch(error => console.error('Błąd pobierania danych z GeoJS:', error));
}

// Pobieranie kodu kraju
function getCountryCode(countryName) {
    fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
        .then(response => response.json())
        .then(data => {
            const countryCode = data[0].idd.root + data[0].idd.suffixes.join("");
            const countryCodeSelect = document.getElementById("countryCode");
            if (countryCodeSelect) {
                for (let option of countryCodeSelect.options) {
                    if (option.value === countryCode) {
                        option.selected = true;
                        break;
                    }
                }
            }
        })
        .catch(error => console.error('Wystąpił błąd:', error));
}

// Obsługa nawigacji między stronami formularza
document.getElementById("nextPage").addEventListener("click", function (event) {
    handlePageNavigation(event, "page1", "page2");
});

document.getElementById("prevPage").addEventListener("click", function () {
    handlePageNavigation(null, "page2", "page1");
});

function handlePageNavigation(event, currentPage, nextPage) {
    if (event) {
        const requiredFields = document.querySelectorAll(`#${currentPage} input[required]`);
        let isValid = validateFormFields(requiredFields);
        if (!isValid) {
            event.preventDefault();
            return;
        }
    }
    document.getElementById(currentPage).style.display = "none";
    document.getElementById(nextPage).style.display = "block";
}

// Obsługa VAT UE
toggleVatFields();
function initializeVatToggle() {
    const vatCheckbox = document.getElementById("vatUE");
    vatCheckbox.addEventListener("change", toggleVatFields);
}
function toggleVatFields() {
    const vatFields = document.querySelectorAll("#vatNumber, #vatHelp, #invoiceData");
    vatFields.forEach(field => {
        field.closest('.mb-3').style.display = document.getElementById("vatUE").checked ? "block" : "none";
    });
}

// Walidacja pól formularza
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    if (!value) {
        isValid = false;
    } else {
        switch (field.id) {
            case "firstName&lastName":
                isValid = value.split(" ").length >= 2;
                break;
            case "exampleInputEmail1":
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case "country":
                isValid = Array.from(document.querySelectorAll("#countryList option"))
                    .map(option => option.value).includes(value);
                break;
            case "countryCode":
                isValid = field.value !== "Wybierz...";
                break;
            case "phoneNumber":
                isValid = /^\d{9,15}$/.test(value);
                break;
            case "zipCode":
                isValid = /^\d{2}-\d{3}$/.test(value) || /^\d+$/.test(value);
                break;
            case "city":
                isValid = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value);
                break;
            case "street":
                isValid = value.length > 0;
                break;
            case "vatNumber":
                if (document.getElementById("vatUE").checked) {
                    isValid = /^[A-Z]{2}\d{8,12}$/.test(value);
                }
                break;
        }
    }

    field.classList.toggle("is-invalid", !isValid);
    field.classList.toggle("is-valid", isValid);
    return isValid;
}

function validateFormFields(fields) {
    let isValid = true;
    fields.forEach(field => {
        if (!validateField(field)) isValid = false;
    });
    return isValid;
}

// Obsługa wysyłki formularza
document.getElementById("form").addEventListener("submit", function (event) {
    const allFields = document.querySelectorAll("#form input[required], #form textarea[required]");
    let isFormValid = validateFormFields(allFields);

    if (!isFormValid) {
        event.preventDefault();
        return;
    }

    event.preventDefault();
    displaySuccessMessage();
});

function displaySuccessMessage() {
    const successMessage = document.createElement("div");
    successMessage.classList.add("alert", "alert-success", "mt-3");
    successMessage.innerHTML = `<strong>Success!</strong> Liczba kliknięć: ${clickCount}`;
    
    const existingMessage = document.getElementById("success-message");
    if (existingMessage) existingMessage.remove();

    successMessage.id = "success-message";
    document.getElementById("form").appendChild(successMessage);
}

document.querySelectorAll("#form input, #form textarea").forEach(input => {
    input.addEventListener("input", function () {
        validateField(this);
    });
});



// Obsługa VAT UE
toggleVatFields();
function initializeVatToggle() {
    const vatCheckbox = document.getElementById("vatUE");
    vatCheckbox.addEventListener("change", toggleVatFields);
}

function toggleVatFields() {
    const vatFields = document.querySelectorAll("#vatNumber, #vatHelp, #invoiceData");

    if (document.getElementById("vatUE").checked) {
        vatFields.forEach(field => {
            field.closest('.mb-3').style.display = "block";
            field.setAttribute("required", "true");
        });
    } else {
        vatFields.forEach(field => {
            field.closest('.mb-3').style.display = "none";
            field.removeAttribute("required");
            field.value = ""; // Usunięcie danych
            field.classList.remove("is-valid", "is-invalid"); // Usunięcie klas walidacji
        });
    }
}