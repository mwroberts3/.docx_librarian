// DOM elements and variables
const section2 = document.getElementById("settings-2"),
section3a = document.getElementById("dl-template-settings-3a"),
section3b = document.getElementById("raw-search-3b");

const useTemplateBtn = document.querySelector(".use-template"),
noTemplateBtn = document.querySelector(".no-template");

const fileUpload = document.querySelector("#file-upload"),
fileNameDisplay = document.querySelectorAll(".file-name");

const initialSearchBtn = document.getElementById("initial-search-button"),
caseSensitivity = document.getElementById('case-sensitive');
let initialSearchTerm = document.getElementById("initial-search-term");

const documentDisplay = document.getElementById("document-display"),
documentContent = document.querySelector(".document-content"),
searchStats = document.querySelector(".search-stats"),
searchedWord = document.querySelector(".searched-word"),
newSearchTerm = document.getElementById('new-search'),
newSearchBtn = document.querySelector(".new-search-btn");

const docsLink = document.getElementById('docs-link'),
dlDocs = document.getElementById('dl-docs');

const categoryList = document.querySelector(".category-list");

let sessionDoc = '';
let reader;

// Event listeners
// Load .docx file
docsLink.addEventListener('click', () => dlDocs.style.display = 'block');

fileUpload.addEventListener("change", () => {
    loadDocx(fileUpload.files[0]);
    section2.classList.add("show");

    fileNameDisplay.forEach((section) => {
        section.textContent = `${fileUpload.files[0].name}`;
    });
});

// Use template
useTemplateBtn.addEventListener('click', () => {
    section3a.classList.add("show")
    createCategoryList();
});

// No template
noTemplateBtn.addEventListener('click', () => section3b.classList.add("show"));

initialSearchBtn.addEventListener("click", () => {
    // Make sure search term is entered
    if (!initialSearchTerm.value) {
        window.alert('please enter search term');
    } else {
        initialSearchTerm = initialSearchTerm.value;
        documentDisplay.style.display = 'block';
        rawSearchDoc(sessionDoc, initialSearchTerm);
    }
});

newSearchBtn.addEventListener("click", () => {
    rawSearchDoc(sessionDoc, newSearchTerm.value);
})

// Functions
function loadDocx(file) {
    reader = new FileReader();
    reader.readAsArrayBuffer(file);
    // console.log(reader.readyState);

    // Make sure reader is ready before displaying
    setTimeout(() => {
            let arrayBuffer = reader.result;
        
            mammoth.convertToHtml({arrayBuffer:arrayBuffer}).then((result) => {
                sessionDoc = result.value;
                // console.log(result.value);
            });
    
            // mammoth.extractRawText({arrayBuffer:arrayBuffer}).then((result) => {
            //     // console.log(result.value)
            // });
            
        }, 100)         
}

function createCategoryList() {
    let list = sessionDoc.split("<strong>LABEL:</strong>");
    let labelList = [];
    let tempSplit = [];
    let seperatedCategories = [];
    // console.log(list[1]);

    list.forEach((row) => {
        console.log(row[0], row[1], row[2], row[3], row[4])
    })

    console.log(list);


    // let tempSplit = list[1].split("CONTENT:");
    // tempSplit[0] = "<strong>LABEL" + tempSplit[0];



    for (let i = 0; i < list.length; i++){
            tempSplit = list[i].split("CONTENT:");
            tempSplit[0] = "<strong>LABEL:</strong>" + tempSplit[0];

            seperatedCategories.push(tempSplit);
    }

    seperatedCategories.forEach((row, index) => {
        if (index !== 0) {
            categoryList.innerHTML += `${row[0]}<br>`;
        }
    })
}

function rawSearchDoc(doc, searchTerm) {
    let caseCheck;

    let regMatch = 0,
    exactMatch = 0;

    if(doc.search(searchTerm.toLowerCase()) === -1 && doc.search(searchTerm.toUpperCase()) === -1){
        window.alert('term not found in document');
    } else {
        console.log(searchTerm.length);
        console.log(doc.length);

        // counts the number of exact matches and regular matches
        for(let i = 0; i < doc.length; i++) {
            if (doc.substring(i, searchTerm.length + i) === searchTerm) {
                exactMatch++;              
            } 

            if (doc.substring(i, searchTerm.length + i).toLowerCase() === searchTerm.toLowerCase()) {
                regMatch++;
            }
        }

        displaySearchStats(exactMatch, regMatch, searchTerm);

        let termHighlight = `<span style="color: red; font-weight: bold">${searchTerm}</span>`;
        
        if (caseSensitivity.checked) {
            caseCheck = "g";
        } else {
            caseCheck = "gi";
        }

        let regex = RegExp(searchTerm, caseCheck);
        doc = doc.replace(regex, termHighlight);

        documentContent.innerHTML = doc;
    };
}

function displaySearchStats(exactMatch, regMatch, searchTerm) {
    searchedWord.innerHTML = `'${searchTerm}'`;

    searchStats.innerHTML = `
    <div><strong>Match:</strong>${regMatch}</div>
        <div><strong>Exact Match:</strong>${exactMatch}</div>
    `;
}