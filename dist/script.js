// DOM elements and variables
const section2 = document.getElementById("settings-2"),
section3a = document.getElementById("dl-template-settings-3a"),
section3b = document.getElementById("raw-search-3b");

const useTemplateBtn = document.querySelector(".use-template"),
noTemplateBtn = document.querySelector(".no-template");

const fileUpload = document.querySelector("#file-upload"),
fileNameDisplay = document.querySelectorAll(".file-name");

const initialSearchBtn = document.getElementById("initial-search-button"),
initialSearchTerm = document.getElementById("initial-search-term");

const documentDisplay = document.querySelector(".document-display");

// Event listeners
fileUpload.addEventListener("change", () => {
    section2.classList.add("show");

    fileNameDisplay.forEach((section) => {
        section.textContent = `${fileUpload.files[0].name}`;
    });
});

useTemplateBtn.addEventListener('click', () => section3a.classList.add("show"));

noTemplateBtn.addEventListener('click', () => section3b.classList.add("show"));

initialSearchBtn.addEventListener("click", () => {
    documentDisplay.style.display = 'block';
    console.log(documentDisplay);
    loadDocx(fileUpload.files[0]);
});

// Functions
function loadDocx(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    console.log(reader.readyState);

    setTimeout(()=>{
        console.log(reader.readyState);
        console.log(reader.result);
        let arrayBuffer = reader.result;

        mammoth.convertToHtml({arrayBuffer:arrayBuffer}).then((result) => {
            documentDisplay.innerHTML = result.value;
            console.log(result.value);
        });

        mammoth.extractRawText({arrayBuffer:arrayBuffer}).then((result) => {
            console.log(result.value)
        });
    },1000);
}

