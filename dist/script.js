// DOM elements and variables
const section2 = document.getElementById("settings-2"),
section3a = document.getElementById("dl-category-select-3a"),
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

const categoryList = document.querySelector(".category-list"),
nextBtn = document.getElementById("next-button"),
retreivedEntries = document.getElementById('retreived-entries'),
collectedEntriesContainer = document.querySelector(".collected-entries-container");

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
    let slicedLabelList = [];
    let uniqueLabelList = [];
    let tempSplit = [];
    let seperatedCategories = [];
    let selectedCategories = [];
    let seperatedSelectedCategories = [];
    // console.log(list[1]);

    console.log(list[0].length);
    // Remove any empty entries
    list = list.filter(row => row.length > 10)

    for(let i = 0; i < list.length; i++) {
        for(let j = 0; j < 100; j++){
            if (list[i][j] !== '<'){
                labelList[i] += list[i][j]
        } else {
            break;
        }
    }}

    labelList.forEach(label => {
        // console.log(label.slice(10));
        label = label.slice(10);
        label = label[0].toUpperCase() + label.slice(1);
        slicedLabelList.push(label);
    })

    uniqueLabelList = [... new Set(slicedLabelList)];
    uniqueLabelList = uniqueLabelList.sort();

    console.log(uniqueLabelList);

    // console.log(labelList);
    // console.log(list);

    // Split each entry in list into two parts, the content headers and the actual content
    for (let i = 0; i < list.length; i++){
        tempSplit = list[i].split("CONTENT:");
        tempSplit[0] = "<strong>LABEL:</strong>" + tempSplit[0];
        tempSplit[2] = slicedLabelList[i];

        seperatedCategories.push(tempSplit);
    }

    // console.log(seperatedCategories);

    uniqueLabelList.forEach((label) => {
        categoryList.innerHTML += `<div><input class="category-checkbox"type="checkbox">&nbsp;${label}</div>`;
    })

    categoryList.addEventListener("click", (e) => {
        if (!e.target.checked){
            selectedCategories = selectedCategories.filter(catName => catName !== (e.target.parentElement.textContent).trim());
        } else if (e.target.tagName === "INPUT")
        {
            selectedCategories.push((e.target.parentElement.textContent).trim());
        } 
        console.log("selected categories", selectedCategories);
    })
    
    nextBtn.addEventListener("click", () => {
        if (selectedCategories.length < 1){
            window.alert("please select at least one category");
        } else {
            for (let i = 0; i < selectedCategories.length; i++) {
                // console.log(seperatedCategories[i][2]);
                for (let j = 0; j < seperatedCategories.length; j++) {
                    if (selectedCategories[i].toLowerCase() === seperatedCategories[j][2].toLowerCase()) {
                        console.log(selectedCategories[i].toLowerCase(), seperatedCategories[j][2].toLowerCase())

                        seperatedSelectedCategories.push(seperatedCategories[j]);
                    }
                }
            }

            createDragandDropUI(seperatedSelectedCategories, selectedCategories);
        }
    }) 
}

function createDragandDropUI(seperatedSelectedCategories, selectedCategories){
    retreivedEntries.style.display = 'block';
    
    // console.log(selectedCategories);
    // console.log(seperatedSelectedCategories);

    seperatedSelectedCategories.forEach((entry) => {
        collectedEntriesContainer.innerHTML += `
        <div class="entry-header" draggable>
            ${entry[0]}
            </strong><p class="show-entry-content">Show Content</p>
            <div class="hidden-entry-content">
                ${entry[1]}            
            </div>
        </div>
        `;
    })

    collectedEntriesContainer.addEventListener("click", (e) => {
        if(e.target.classList.contains("show-entry-content")){
            e.target.nextElementSibling.classList.toggle("show-content");
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