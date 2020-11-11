"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// DOM elements and variables
var section2 = document.getElementById("settings-2"),
    section3a = document.getElementById("dl-category-select-3a"),
    section3b = document.getElementById("raw-search-3b");
var useTemplateBtn = document.querySelector(".use-template"),
    noTemplateBtn = document.querySelector(".no-template");
var fileUpload = document.querySelector("#file-upload"),
    fileNameDisplay = document.querySelectorAll(".file-name");
var initialSearchBtn = document.getElementById("initial-search-button"),
    caseSensitivity = document.getElementById('case-sensitive');
var initialSearchTerm = document.getElementById("initial-search-term");
var documentDisplay = document.getElementById("document-display"),
    documentContent = document.querySelector(".document-content"),
    searchStats = document.querySelector(".search-stats"),
    searchedWord = document.querySelector(".searched-word"),
    newSearchTerm = document.getElementById('new-search'),
    newSearchBtn = document.querySelector(".new-search-btn");
var docsLink = document.getElementById('docs-link'),
    dlDocs = document.getElementById('dl-docs');
var categoryList = document.querySelector(".category-list"),
    nextBtn = document.getElementById("next-button"),
    retreivedEntries = document.getElementById('retreived-entries'),
    collectedEntriesContainer = document.querySelector(".collected-entries-container"),
    selectDifCatBtn = document.getElementById("select-different-categories-btn"),
    saveAsNewDocxFileBtn = document.getElementById("save-as-new-docx-file");
var dragStartIndex;
var dragged;
var sessionDocHTML = '';
var sessionRawText = '';
var reader;
var seperatedCategories = [];
var seperatedSelectedCategories = [];
var selectedCategories = []; // Event listeners
// Load .docx file

docsLink.addEventListener('click', function () {
  return dlDocs.style.display = 'block';
});
fileUpload.addEventListener("change", function () {
  loadDocx(fileUpload.files[0]);
  section2.classList.add("show");
  fileNameDisplay.forEach(function (section) {
    section.textContent = "".concat(fileUpload.files[0].name);
  });
}); // Use template

useTemplateBtn.addEventListener('click', function () {
  section3a.classList.add("show");
  createCategoryList();
});
collectedEntriesContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("show-entry-content")) {
    e.target.nextElementSibling.classList.toggle("show-content");
  }
});
selectDifCatBtn.addEventListener('click', function () {
  retreivedEntries.style.display = 'none';
  collectedEntriesContainer.innerHTML = '';
  seperatedSelectedCategories.splice(0);
});
categoryList.addEventListener("click", function (e) {
  if (!e.target.checked) {
    selectedCategories = selectedCategories.filter(function (catName) {
      return catName !== e.target.nextElementSibling.textContent.trim();
    });
  } else if (e.target.tagName === "INPUT") {
    selectedCategories.push(e.target.nextElementSibling.textContent.trim());
  }

  console.log("selected categories", selectedCategories);
  selectedCategories = _toConsumableArray(new Set(selectedCategories));
  console.log("selected categories", selectedCategories);
});
nextBtn.addEventListener("click", function () {
  if (selectedCategories.length < 1) {
    window.alert("please select at least one category");
  } else {
    for (var i = 0; i < selectedCategories.length; i++) {
      // console.log(seperatedCategories[i][2]);
      for (var j = 0; j < seperatedCategories.length; j++) {
        if (selectedCategories[i] === seperatedCategories[j][2]) {
          console.log(selectedCategories[i].toLowerCase(), seperatedCategories[j][2].toLowerCase());
          seperatedSelectedCategories.push(seperatedCategories[j]);
        }
      }
    }

    createDragandDropUI(seperatedSelectedCategories);
  }
});
saveAsNewDocxFileBtn.addEventListener("click", function () {
  saveAsDocxFile();
}); // No template

noTemplateBtn.addEventListener('click', function () {
  return section3b.classList.add("show");
});
initialSearchBtn.addEventListener("click", function () {
  // Make sure search term is entered
  if (!initialSearchTerm.value) {
    window.alert('please enter search term');
  } else {
    initialSearchTerm = initialSearchTerm.value;
    documentDisplay.style.display = 'block';
    rawSearchDoc(sessionDocHTML, initialSearchTerm);
  }
});
newSearchBtn.addEventListener("click", function () {
  rawSearchDoc(sessionDocHTML, newSearchTerm.value);
}); // Functions

function loadDocx(file) {
  reader = new FileReader();
  reader.readAsArrayBuffer(file); // console.log(reader.readyState);
  // Make sure reader is ready before displaying

  setTimeout(function () {
    var arrayBuffer = reader.result;
    mammoth.convertToHtml({
      arrayBuffer: arrayBuffer
    }).then(function (result) {
      sessionDocHTML = result.value; // console.log(result.value);
    });
    mammoth.extractRawText({
      arrayBuffer: arrayBuffer
    }).then(function (result) {
      sessionRawText = result.value; // console.log(sessionRawText);
    });
  }, 100);
}

function createCategoryList() {
  var list = sessionDocHTML.split("<strong>LABEL:</strong>");
  var labelList = [];
  var slicedLabelList = [];
  var uniqueLabelList = [];
  var tempSplit = []; // Remove any empty entries

  list = list.filter(function (row) {
    return row.length > 10;
  });

  for (var i = 0; i < list.length; i++) {
    for (var j = 0; j < 100; j++) {
      if (list[i][j] !== '<') {
        labelList[i] += list[i][j];
      } else {
        break;
      }
    }
  }

  labelList.forEach(function (label) {
    // console.log(label.slice(10));
    label = label.slice(10);
    label = label[0].toUpperCase() + label.slice(1);
    slicedLabelList.push(label);
  }); // Split each entry in list into two parts, the content headers and the actual content

  for (var _i = 0; _i < list.length; _i++) {
    tempSplit = list[_i].split("CONTENT:");
    tempSplit[0] = "<strong>LABEL:</strong>" + tempSplit[0];
    tempSplit[2] = slicedLabelList[_i];
    seperatedCategories.push(tempSplit);
  }

  var copy = slicedLabelList.slice(0);

  for (var _i2 = 0; _i2 < slicedLabelList.length; _i2++) {
    var count = 0;

    for (var k = 0; k < copy.length; k++) {
      if (slicedLabelList[_i2] === copy[k]) {
        count++;
        delete copy[k];
      }
    }

    if (count > 0) {
      var cat = new Object();
      cat.catName = slicedLabelList[_i2];
      cat.count = count;
      uniqueLabelList.push(cat);
    }
  }

  uniqueLabelList.sort(function (a, b) {
    var nameA = a.catName.toLowerCase();
    var nameB = b.catName.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
  });
  console.log("uniqueLabelList", uniqueLabelList);
  console.log("sliced Label List", slicedLabelList); // console.log(uniqueLabelList);
  // console.log(labelList);
  // console.log(list);  
  // console.log(seperatedCategories);

  uniqueLabelList.forEach(function (row) {
    categoryList.innerHTML += "<div><input class=\"category-checkbox\"type=\"checkbox\">&nbsp;<span>".concat(row.catName, "</span> (").concat(row.count, ")</div>");
  });
}

function createDragandDropUI(seperatedSelectedCategories) {
  retreivedEntries.style.display = 'block'; // console.log(selectedCategories);

  console.log(seperatedSelectedCategories);
  seperatedSelectedCategories.forEach(function (entry, index) {
    collectedEntriesContainer.innerHTML += "\n        <div class=\"selected-entry entry-header\" draggable=\"true\" data-index=".concat(index, ">\n            ").concat(entry[0], "\n            </strong><p class=\"show-entry-content\">Show Content</p>\n            <div class=\"hidden-entry-content\">\n                ").concat(entry[1], "            \n            </div>\n        </div>\n        ");
  });
  dragEvents();
}

function dragEvents() {
  var draggables = document.querySelectorAll('.selected-entry');
  draggables.forEach(function (draggable) {
    // Drag start
    draggable.addEventListener('dragstart', function () {
      dragged = draggable;
      dragged.classList.add('selected-to-drag');
    }); // Drag over

    draggable.addEventListener('dragover', function (e) {
      e.preventDefault();
    }); // Drag drop

    draggable.addEventListener('drop', function () {
      draggable.classList.toggle('drag-over');
      dragged.classList.remove('selected-to-drag');
      dragged.dataset.index = draggable.dataset.index;

      for (var i = 0; i < draggables.length; i++) {
        if (draggables[i] !== dragged) {
          if (draggables[i].dataset.index >= dragged.dataset.index) {
            draggables[i].dataset.index++;
          }
        }
      }

      reorganizeCategories(draggables);
    }); // Drag enter

    draggable.addEventListener('dragenter', function () {
      return draggable.classList.toggle('drag-over');
    }); // Drag leave

    draggable.addEventListener('dragleave', function () {
      return draggable.classList.toggle('drag-over');
    });
  });
}

function reorganizeCategories(draggables) {
  draggables = Array.from(draggables);
  draggables.sort(function (a, b) {
    return a.dataset.index - b.dataset.index;
  });
  collectedEntriesContainer.innerHTML = '';
  draggables.forEach(function (entry) {
    collectedEntriesContainer.innerHTML += entry.outerHTML;
  });
  dragEvents();
}

function saveAsDocxFile() {// TODO
}

function rawSearchDoc(doc, searchTerm) {
  var caseCheck;
  var regMatch = 0,
      exactMatch = 0;

  if (doc.search(searchTerm.toLowerCase()) === -1 && doc.search(searchTerm.toUpperCase()) === -1) {
    window.alert('term not found in document');
  } else {
    console.log(searchTerm.length);
    console.log(doc.length); // counts the number of exact matches and regular matches

    for (var i = 0; i < doc.length; i++) {
      if (doc.substring(i, searchTerm.length + i) === searchTerm) {
        exactMatch++;
      }

      if (doc.substring(i, searchTerm.length + i).toLowerCase() === searchTerm.toLowerCase()) {
        regMatch++;
      }
    }

    displaySearchStats(exactMatch, regMatch, searchTerm);
    var termHighlight = "<span style=\"color: red; font-weight: bold\">".concat(searchTerm, "</span>");

    if (caseSensitivity.checked) {
      caseCheck = "g";
    } else {
      caseCheck = "gi";
    }

    var regex = RegExp(searchTerm, caseCheck);
    doc = doc.replace(regex, termHighlight);
    documentContent.innerHTML = doc;
  }

  ;
}

function displaySearchStats(exactMatch, regMatch, searchTerm) {
  searchedWord.innerHTML = "'".concat(searchTerm, "'");
  searchStats.innerHTML = "\n    <div><strong>Match:</strong>".concat(regMatch, "</div>\n        <div><strong>Exact Match:</strong>").concat(exactMatch, "</div>\n    ");
}
