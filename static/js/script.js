// preselect checkboxes
document.addEventListener('DOMContentLoaded', function () {
    // Use JavaScript to preselect multiple checkboxes
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = true;
    });
});


function createAbreicherungBox(container, entry) {
    var box = document.createElement('div');
    box.classList.add('abreicherung-box');

    var header = document.createElement('h3');
    header.textContent = entry['Methodenname'];

    var mainText = document.createElement('p');
    mainText.textContent = entry['Methode'];
    mainText.classList.add('full-text-collapsed');
    mainText.style.display = 'none'; // Initially hide the full text

    box.appendChild(header);
    box.appendChild(mainText);

    // Create an edit button
    var editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-button', 'right-aligned'); // Apply existing styles
    box.appendChild(editButton);

    container.appendChild(box);

    // Position the edit button at the top right corner of the box
    editButton.style.position = 'absolute';
    editButton.style.top = '5px';
    editButton.style.right = '5px';

    // Click functionality - Expand box and display full text or collapse
    var isExpanded = false; // Track the state of the box

    box.addEventListener('click', function () {
        if (isExpanded) {
            box.style.height = '50px'; // Set default height
            mainText.style.display = 'none'; // Hide full text
        } else {
             mainText.style.display = 'block'; // Display full text initially

            // Calculate the total height including the expanded text and header
            var textHeight = mainText.scrollHeight;
            var headerHeight = header.scrollHeight;
            var totalTextHeight = textHeight + headerHeight + 40;

            box.style.height = totalTextHeight + 'px'; // Expand box
        }

        isExpanded = !isExpanded; // Toggle state
    });

    // Edit button functionality - Open custom popup for editing
    editButton.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevent box click event from firing

        openCustomEditPopup(entry, function (updatedContent) {
            // Update the content in the box after editing
            mainText.textContent = updatedContent;
        });
    });
}

// Function to open the custom edit popup
function openCustomEditPopup(entry, callback) {
    var popup = document.getElementById('customPopupAb');
    var confirmPopup = document.getElementById('customPopupMethode');
    var titleTextarea = document.getElementById('title-textarea');
    var descriptionTextarea = document.getElementById('description-textarea');
    var saveButton = document.getElementById('methode-speichern');
    var cancelButton = document.getElementById('methode-cancel');
    var confirmYesButton = document.getElementById('confirmYesMethode');
    var confirmNoButton = document.getElementById('confirmNoMethode');

    // Set initial values in textareas
    titleTextarea.value = entry['Methodenname'];
    var oldTitle = entry['Methodenname'];
    descriptionTextarea.value = entry['Methode'];

    // Show the popup
    popup.style.display = 'block';
    popup.style.position = 'fixed';
    popup.style.padding = '15%';
    popup.style.zIndex = '1000';
    popup.style.height = '1000px';

    // Save button functionality
    saveButton.onclick = function () {
        // Display the confirmation popup
        confirmPopup.style.display = 'block';
        confirmPopup.style.position = 'fixed';
        confirmPopup.style.padding = '15%';
        confirmPopup.style.zIndex = '1001';
    };

    // Confirm Yes button functionality
    confirmYesButton.onclick = function () {
        // Call the callback with the updated content
        var updatedContent = {
            'Methodenname': titleTextarea.value,
            'Methode': descriptionTextarea.value
        };

        // Update the content in the corresponding box
        updateAbreicherungBox(entry, updatedContent);

        // Hide both popups
        popup.style.display = 'none';
        confirmPopup.style.display = 'none';

        // Update database
        updateDatabase(titleTextarea.value, descriptionTextarea.value);
    };

    function updateDatabase(title, description) {
        var userInput = document.getElementById('user-input').value;
        fetch('/save_edited_method', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ textTitle: title, textDescription: description, input: userInput, oldMethodTitle: oldTitle }),
        })
        .then(response => response.text())
        .catch(error => {
            console.error('Error:', error);
        });
    }

            // Confirm No button functionality
    confirmNoButton.onclick = function () {
                // Hide the confirmation popup
        confirmPopup.style.display = 'none';
    };

            // Cancel button functionality
    cancelButton.onclick = function () {
                // Hide the popup
        popup.style.display = 'none';
    };
}


// Function to update the content in the corresponding Abreicherung box
function updateAbreicherungBox(entry, updatedContent) {
    // Find the corresponding box by comparing 'Methodenname'
    var boxes = document.querySelectorAll('.abreicherung-box');
    for (var i = 0; i < boxes.length; i++) {
        var header = boxes[i].querySelector('h3');
        if (header.textContent === entry['Methodenname']) {
            // Update the content in the box
            var mainText = boxes[i].querySelector('p');
            mainText.textContent = updatedContent['Methode'];
            header.textContent = updatedContent['Methodenname'];
            break; // Exit the loop once the box is found and updated
        }
    }
} 


function executePythonFunction() {
    // falls vorher gesucht wurde und keine Einträge vorhanden sind, muss Nachricht aus GUI entfernt werden
    document.querySelector('.infoNoEntries').style.display = 'none';
    document.querySelector('.infoSimilarEntries').style.display = 'none';
    document.getElementById("dodoCookie").style.display = 'none';
    document.getElementById("infoNoSearch").style.display = 'none';

    document.getElementById('theDodoTalks').style.display = 'none';

    var userInput = document.getElementById('user-input').value;
    var categories = Array.from(document.querySelectorAll('input[name=category]:checked')).map(checkbox => checkbox.value);

    if (userInput === '') {
        var noInfo = document.getElementById("infoNoSearch");
        noInfo.style.display = 'block';
        noInfo.style.position = 'fixed';
        noInfo.style.bottom = '0';
        noInfo.style.paddingBottom = '100px';
        noInfo.style.zIndex = '1001';
    } else {

        fetch('/execute-function', {
            method: 'POST',
            body: JSON.stringify({ input: userInput, categories: categories }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data === null) {
                // hide displayed data
                ['allg-header', 'name-header', 'namen-header', 'abk-header', 'name', 'namen', 'abk','analytik-header', 'analytik-t-header', 'analytik-data', 'biochemie-header', 'mol_masse-header', 'aminos-header', 'oligo-header', 'glyko-header', 'bind-header', 'enzym-header', 'mol_masse', 'aminos', 'oligo', 'glyko', 'bind', 'enzym', 'funktionen-header', 'synth_gewebe-header', 'elek-header', 'immun-header', 'haupt-header', 'synth_gewebe', 'elek', 'immun', 'haupt', 'diagnostik-header', 'biomat-header', 'ref-header', 'hohe_werte-header', 'niedrige_werte-header', 'biomat', 'ref', 'hohe_werte', 'niedrige_werte', 'abreicherung-section', 'abr-header', 'deleteEntryButton'].forEach(cat => {
                    document.getElementById(cat).style.display = 'none';
                })

                // Dodo easter eggs messages
                var dodoInfo = document.getElementById("dodoCookie");
                dodoInfo.style.display = 'block';
                dodoInfo.style.position = 'fixed';
                dodoInfo.style.bottom = '0';
                dodoInfo.style.paddingBottom = '100px';
                dodoInfo.style.zIndex = '1001';

                var possibleMessages = [
                    "Ich mag Kekse.",
                    "Das Dodo-Team hat sich Kekse verdient.",
                    "Hiii, wo sind meine Kekse?",
                    "KEKSE!",
                    "Als Belohnung nehme ich Kekse.",
                    "Lecker Kekse!"
                    ];
                var pElement = document.querySelector('#dodoCookie .info-eintrag .p4');

                // Randomly select a message from the array
                var randomIndex = Math.floor(Math.random() * possibleMessages.length);
                var randomMessage = possibleMessages[randomIndex];

                // Set the text content of the <p> element to the random message
                pElement.textContent = randomMessage;


                // ähnlich geschriebene Parameter anzeigen, falls vorhanden
                 fetch('/check_similar_parameter', {
                    method: 'POST',
                    body: JSON.stringify({ input: userInput }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    var infoNoEntries = document.querySelector('.infoNoEntries');
                    var infoSimilarEntries = document.querySelector('.infoSimilarEntries');

                    if (data.length === 0) {
                        infoNoEntries.style.display = 'block';                         
                    } else {
                        var ul = infoSimilarEntries.querySelector('ul');
                        // Clear the existing list items by setting innerHTML to an empty string
                        if (!ul) {
                            ul = document.createElement('ul');
                            infoSimilarEntries.appendChild(ul);
                        }
                        while (ul.firstChild) {
                            ul.removeChild(ul.firstChild);
                        }
                        infoSimilarEntries.style.display = 'block';
                        data.forEach(entry => {
                            var li = document.createElement('li');
                            li.classList.add('p4');
                            li.textContent = entry;
                            li.style.color = '#8CBDB9';
                            li.style.fontWeight = 'bold';
                            li.style.listStylePosition = 'inside';
                            ul.appendChild(li);
                        });
                        infoSimilarEntries.appendChild(ul);
                    }
                })
        
            } else {
                // Show the headers after data is loaded
                document.getElementById('allg-header').style.display = 'table-cell';
                document.getElementById('name-header').style.display = 'table-cell';
                document.getElementById('namen-header').style.display = 'table-cell';
                document.getElementById('abk-header').style.display = 'table-cell';
                document.getElementById('name').style.display = 'table-cell';
                document.getElementById('namen').style.display = 'table-cell';
                document.getElementById('abk').style.display = 'table-cell';
                // Show data of the table namen
                document.getElementById('name').textContent = data['Name'].name;
                document.getElementById('namen').textContent = data['Name'].namen;
                document.getElementById('abk').textContent = data['Name'].abk;
                // Show delete button
                document.getElementById('deleteEntryButton').style.display='flex'

                if (categories.includes('Analytik')) {
                    // Show the Analytik table header
                    document.getElementById('analytik-header').style.display = 'table-cell';
                    document.getElementById('analytik-t-header').style.display = 'table-row';

                    // Get the header row element
                    var headerRow = document.getElementById('analytik-t-header');

                    // Add a class to the header row
                    headerRow.classList.add('special-header-row');

                    // Get the table body element
                    var tableBody = document.getElementById('analytik-data');

                    // Clear any previous data
                    tableBody.innerHTML = '';

                    // Iterate through the data and populate the table
                    if (Array.isArray(data['Analytik']) && data['Analytik'].length > 0) {
                        data['Analytik'].forEach(entry => {
                            var row = document.createElement('tr');

                            // Add cells for each field in the table
                            var nameCell = document.createElement('td');
                            nameCell.textContent = entry['name'];
                            row.appendChild(nameCell);

                            var laborCell = document.createElement('td');
                            laborCell.textContent = entry['labor'];
                            row.appendChild(laborCell);

                            var labNameCell = document.createElement('td');
                            labNameCell.textContent = entry['name_labor'];
                            row.appendChild(labNameCell);

                            var methodeCell = document.createElement('td');
                            methodeCell.textContent = entry['methode'];
                            row.appendChild(methodeCell);

                            var messsystemCell = document.createElement('td');
                            messsystemCell.textContent = entry['messsystem'];
                            row.appendChild(messsystemCell);

                            var herstellerCell = document.createElement('td');
                            herstellerCell.textContent = entry['hersteller'];
                            row.appendChild(herstellerCell);

                            var preisCell = document.createElement('td');
                            preisCell.textContent = entry['preis'];
                            row.appendChild(preisCell);

                            // Add a class to the cells in the 'Analytik' table
                            laborCell.classList.add('special-cell');
                            labNameCell.classList.add('special-cell');
                            methodeCell.classList.add('special-cell');
                            messsystemCell.classList.add('special-cell');
                            herstellerCell.classList.add('special-cell');
                            preisCell.classList.add('special-cell');

                            tableBody.appendChild(row);
                        });
                    }

                    // Display the table data explicitly
                    tableBody.style.display = 'table-row-group'; // Or set the appropriate display property
                } else {
                    // If Analytik checkbox is unchecked, hide the table data
                    document.getElementById('analytik-data').style.display = 'none';
                    document.getElementById('analytik-header').style.display = 'none';
                    document.getElementById('analytik-t-header').style.display = 'none';
                }

                // table biochemie
                if (categories.includes('Biochemie')) {
                    // Show the table cells
                    ['biochemie-header', 'mol_masse-header', 'aminos-header', 'oligo-header', 'glyko-header', 'bind-header', 'enzym-header', 'mol_masse', 'aminos', 'oligo', 'glyko', 'bind', 'enzym'].forEach(cat => {
                        document.getElementById(cat).style.display = 'table-cell';
                    });

                    // Display data for Biochemie
                    document.getElementById('mol_masse').textContent = data['Biochemie']['Molekulare Masse'];
                    document.getElementById('aminos').textContent = data['Biochemie']['Aminosäuren'];
                    document.getElementById('oligo').textContent = data['Biochemie']['Oligomerisierung'];
                    document.getElementById('glyko').textContent = data['Biochemie']['Glykolisierung'];
                    document.getElementById('bind').textContent = data['Biochemie']['Bindungsmotiv'];
                    document.getElementById('enzym').textContent = data['Biochemie']['Enzymfunktion'];
                } else {
                    // If Biochemie checkbox is unchecked, hide the table data
                    ['biochemie-header', 'mol_masse-header', 'aminos-header', 'oligo-header', 'glyko-header', 'bind-header', 'enzym-header', 'mol_masse', 'aminos', 'oligo', 'glyko', 'bind', 'enzym'].forEach(cat => {
                        document.getElementById(cat).style.display = 'none';
                    });
                }

                // table funktionen
                if (categories.includes('Funktion')) {
                    // Show the table cells
                    ['funktionen-header', 'synth_gewebe-header', 'elek-header', 'immun-header', 'haupt-header', 'synth_gewebe', 'elek', 'immun', 'haupt'].forEach(cat => {
                        document.getElementById(cat).style.display = 'table-cell';
                    });

                    // Display data for Funktion
                    document.getElementById('synth_gewebe').textContent = data['Funktion']['Synthetisierendes Gewebe'];
                    document.getElementById('elek').textContent = data['Funktion']['Elektrophorese'];
                    document.getElementById('immun').textContent = data['Funktion']['Immunsystem'];
                    document.getElementById('haupt').textContent = data['Funktion']['Hauptfunktion'];

                } else {
                    // If Funktion checkbox is unchecked, hide the table data
                    ['funktionen-header', 'synth_gewebe-header', 'elek-header', 'immun-header', 'haupt-header', 'synth_gewebe', 'elek', 'immun', 'haupt'].forEach(cat => {
                        document.getElementById(cat).style.display = 'none';
                    });
                }
            
                // table diagnostik
                 if (categories.includes('Diagnostik')) {
                    // Show the table cells
                    ['diagnostik-header', 'biomat-header', 'ref-header', 'hohe_werte-header', 'niedrige_werte-header', 'biomat', 'ref', 'hohe_werte', 'niedrige_werte'].forEach(cat => {
                        document.getElementById(cat).style.display = 'table-cell';
                    });

                    // Display data for Diagnostik
                    document.getElementById('biomat').textContent = data['Diagnostik']['Biomaterial'];
                    document.getElementById('ref').textContent = data['Diagnostik']['Referenzbereich'];
                    document.getElementById('hohe_werte').textContent = data['Diagnostik']['Erhöhte Werte'];
                    document.getElementById('niedrige_werte').textContent = data['Diagnostik']['Erniedrigte Werte'];
                } else {
                    // If Diagnbostik checkbox is unchecked, hide the table data
                    ['diagnostik-header', 'biomat-header', 'ref-header', 'hohe_werte-header', 'niedrige_werte-header', 'biomat', 'ref', 'hohe_werte', 'niedrige_werte'].forEach(cat => {
                        document.getElementById(cat).style.display = 'none';
                    });
                }

                // data abreicherung

                if (categories.includes('Abreicherung')) {
                    var abreicherungData = data['Abreicherung'];
                    if (abreicherungData) {
                        document.getElementById('abreicherung-section').style.display = 'block';
                        document.getElementById('abr-header').style.display = 'block';

                        var abreicherungBoxes = document.getElementById('abreicherung-boxes');
                        abreicherungBoxes.innerHTML = ''; // Clear previous content

                        // Check if the Abreicherung data is an array or a single object
                        if (Array.isArray(abreicherungData)) {
                            // If it's an array, create boxes for each entry
                            abreicherungData.forEach(function(entry) {
                                createAbreicherungBox(abreicherungBoxes, entry);
                            });
                        } else {
                            // If it's a single object, create a box for that entry
                            createAbreicherungBox(abreicherungBoxes, abreicherungData);
                        }
                    } else {
                        document.getElementById('abreicherung-section').style.display = 'none';
                    }
                } else {
                    document.getElementById('abreicherung-section').style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function showSuggestions() {
    var userInput = document.getElementById('user-input').value.toLowerCase().trim();
    var dropdown = document.getElementById('suggestions');
    var dodoTalks = document.getElementById('theDodoTalks');

    if (userInput.length === 0) {
        dropdown.innerHTML = ''; // Clear suggestions if input is empty
        dropdown.style.display = 'none';
        return;
    }

    // AJAX request to fetch suggestions from the backend
    fetch('/get-suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        var suggestions = data.suggestions; // Fetched suggestions from the backend

        var matchedSuggestions = suggestions.filter(function(suggestion) {
            return suggestion.toLowerCase().includes(userInput);
        });

        var suggestionHTML = '';
        matchedSuggestions.forEach(function(suggestion) {
            suggestionHTML += '<div onclick="selectSuggestion(\'' + suggestion + '\')">' + suggestion + '</div>';
        });

        if (suggestionHTML !== '') {
            dropdown.innerHTML = suggestionHTML;
            dropdown.style.display = 'block';
            dodoTalks.style.display = 'none'; // Hide theDodoTalks if suggestions are present
        } else {
            dropdown.innerHTML = ''; // No matching suggestions, hide the dropdown
            dropdown.style.display = 'none';
            dodoTalks.style.display = 'block'; // Show theDodoTalks if no suggestions are present
        }
    })
    .catch(error => {
        console.error('Error fetching suggestions:', error);
    });
}

function selectSuggestion(selectedValue) {
    document.getElementById('user-input').value = selectedValue;
    document.getElementById('suggestions').style.display = 'none';
}


function neuerEintrag() {
    // falls vorher gesucht wurde und keine Einträge vorhanden sind, muss Nachricht aus GUI entfernt werden
    document.querySelector('.infoNoEntries').style.display = 'none';
    document.querySelector('.infoSimilarEntries').style.display = 'none';
    document.getElementById("dodoCookie").style.display = 'none';
    document.getElementById("infoNoSearch").style.display = 'none';

    // Hide elements from containers 2, 3, and 4
    document.querySelector('.container2').style.display = 'none';
    document.querySelector('.container3').style.display = 'none';
    document.querySelector('.container4').style.display = 'none';

    // Show the new content
    document.querySelector('.new-entry').style.display = 'flex';
    document.querySelector('.container5').style.display = 'flex';
}

function goBackToOriginal() {
    document.getElementById("dodoEntryEmpty").style.display = 'none';
    document.getElementById("dodoEntryExists").style.display = 'none';

    // Show elements from containers 2, 3, and 4
    document.querySelector('.container2').style.display = 'flex';
    document.querySelector('.container3').style.display = 'flex';
    document.querySelector('.container4').style.display = 'flex';

    // Hide the new content
    document.querySelector('.new-entry').style.display = 'none';
    document.querySelector('.container5').style.display = 'none';
}

function acceptInfoEntry() {
    var entryInfo = document.getElementById("dodoEntryExists");
    entryInfo.style.display = 'none';
}

function acceptInfoEmpty() {
    var entryInfo = document.getElementById("dodoEntryEmpty");
    entryInfo.style.display = 'none';
}

function submitForm() {
    var newName = document.getElementById("new_name").value;

    if (newName.length > 0) {
        fetch('/entry_check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paraName: newName }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                var entryInfo = document.getElementById("dodoEntryExists");
                entryInfo.style.display = 'block';
                entryInfo.style.position = 'fixed';
                entryInfo.style.bottom = '0';
                entryInfo.style.paddingBottom = '100px';
                entryInfo.style.zIndex = '1001';
                                
            } else {
                displayNewEntryMessage();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        var entryInfo = document.getElementById("dodoEntryEmpty");
        entryInfo.style.display = 'block';
        entryInfo.style.position = 'fixed';
        entryInfo.style.bottom = '0';
        entryInfo.style.paddingBottom = '100px';
        entryInfo.style.zIndex = '1001';
        return false;
    }
}


function displayNewEntryMessage() {
    var newEntrySave = document.getElementById('popupNeuerEintrag');
    newEntrySave.style.display = 'flex';

    var confirmYes = document.getElementById('confirmYesNewEntry');
    var confirmNo = document.getElementById('confirmNoNewEntry');

    confirmNo.onclick = function() {
        newEntrySave.style.display = 'none';
    }

    confirmYes.onclick = function() {
        newEntrySave.style.display = 'none';

        // In Datenbank speichern
        saveNewEntryDatabase()

        function saveNewEntryDatabase(title, description) {
            var name = document.getElementById('new_name').value;
            var weitereNamen = document.getElementById('new_names').value;
            var abk = document.getElementById('new_abk').value;
            var molmasse = document.getElementById('new_molmasse').value;
            var aminos = document.getElementById('new_aminos').value;
            var oligo = document.getElementById('new_oligo').value;
            var glyko = document.getElementById('new_glyko').value;
            var bind = document.getElementById('new_bind').value;
            var enzym = document.getElementById('new_enzym').value;
            var synthGew = document.getElementById('new_synthgew').value;
            var elek = document.getElementById('new_elek').value;
            var immun = document.getElementById('new_immun').value;
            var haupt = document.getElementById('new_haupt').value;
            var biomat = document.getElementById('new_biomat').value;
            var ref = document.getElementById('new_ref').value;
            var hoch = document.getElementById('new_hohewerte').value;
            var niedrig = document.getElementById('new_niedrigewerte').value;
            var methName = document.getElementById('new_methodenname_ab').value;
            var meth = document.getElementById('new_methodeab').value;

            fetch('/save_new_entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paraName: name, paraNamen: weitereNamen, paraAbk: abk, molMasse: molmasse, aminoAcids: aminos, oligomerisierung: oligo, glykolisierung: glyko, bindMotiv: bind, enzymFunktion: enzym, synthGewebe: synthGew, elektrophorese: elek, immunsystem: immun, hauptfunktion: haupt, biomaterial: biomat, referenz:ref, hoheWerte: hoch, niedrigeWerte: niedrig,methodenName: methName, methode: meth}),
            })
            .then(response => response.text())
            .catch(error => {
                console.error('Error:', error);
            });
        }

        location.reload();

    }
}

function editSection(sectionId, editButtonId) {
    var section = document.getElementById(sectionId);
    var dataCells = section.querySelectorAll('td');

    var originalData = []; // Array to store original data

    dataCells.forEach(function (cell) {
        var text = cell.textContent;
        originalData.push(text); // Store original data when initializing
        var input = document.createElement('textarea');
        input.value = text;
        cell.textContent = '';
        cell.appendChild(input);
    });


    var editButton = document.getElementById(editButtonId);
    editButton.style.display = 'none'; // Hide the edit button

    var saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button'); // Add a class for styling

    var cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button'); // Add a class for styling

    saveButton.onclick = function () {
        var customPopupSave = document.getElementById('customPopup');
        customPopupSave.style.display = 'flex';

        var confirmYes = document.getElementById('confirmYes');
        var confirmNo = document.getElementById('confirmNo');

        confirmYes.onclick = function () {
            // Handle "Yes" button click action
            var input_values = []
            inputs = section.querySelectorAll('textarea');
            inputs.forEach(function (input, index) {
                var cell = dataCells[index];
                cell.textContent = input.value;
                input_values.push(input.value)
            });
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            customPopupSave.style.display = 'none'; // Hide the popup after action

            // In Datenbank speichern
            saveInDatabase()

            function saveInDatabase(title, description) {
                var userInput = document.getElementById('user-input').value;
                fetch('/save_in_database', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tableName: sectionId, newEntries: input_values, input: userInput}),
                })
                .then(response => response.text())
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        };

        confirmNo.onclick = function () {
            // Handle "No" button click action or close the popup
            customPopupSave.style.display = 'none'; // Hide the popup without taking action
        };
    };

    cancelButton.onclick = function () {
        // Reset the data to the original state when clicking cancel
        dataCells.forEach(function (cell, index) {
            cell.textContent = originalData[index];
        });

        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        editButton.style.display = 'inline-block';

        var customPopup = document.getElementById('customPopup');
        customPopupSave.style.display = 'none'; // Hide the popup
    };

    editButton.parentNode.insertBefore(cancelButton, editButton.nextSibling);
    editButton.parentNode.insertBefore(saveButton, editButton.nextSibling);
}

// Check for update status from backend and display error message if update failed
document.addEventListener("DOMContentLoaded", function() {
    fetch('/check-update-status')
        .then(response => response.json())
        .then(data => {
            if (data.update_status === false) {
                document.getElementById('error-message').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error checking update status:', error);
        });
});

function neueMethode() {
    var customPopupAbNew = document.getElementById('customPopupAbNew');
    customPopupAbNew.style.display = 'block';
    customPopupAbNew.style.padding = '15%';

    var saveButton = document.getElementById('methode-speichern-new');

    // Declare confirmPopup in the outer scope
    var confirmPopup;

    // Save button functionality
    saveButton.onclick = function () {
        confirmPopup = document.getElementById('customPopupMethode');

        // Display the confirmation popup
        confirmPopup.style.display = 'block';
        confirmPopup.style.position = 'fixed';
        confirmPopup.style.padding = '15%';
        confirmPopup.style.zIndex = '1001';
    };

    var confirmYesButton = document.getElementById('confirmYesMethode');
    var confirmNoButton = document.getElementById('confirmNoMethode');

    // Confirm No button functionality
    confirmNoButton.onclick = function () {
        // Check if confirmPopup is defined before using it
        if (confirmPopup) {
            confirmPopup.style.display = 'none';
        }
    };

    // Confirm Yes button functionality
    confirmYesButton.onclick = function () {
        // Check if confirmPopup is defined before using it
        if (confirmPopup) {
            confirmPopup.style.display = 'none';
        }

        var methodenName = document.getElementById('default-title-textarea').textContent;
        var methode = document.getElementById('default-description-textarea').textContent;
        var entry = {
            'Methodenname': methodenName,
            'Methode': methode
            };
        var container = document.getElementById('abreicherung-boxes');
        createAbreicherungBox(container, entry);

        customPopupAbNew.style.display = 'none';

        // Update database
        updateDatabase(methodenName, methode);

    };

    function updateDatabase(title, description) {
        var userInput = document.getElementById('user-input').value;
        fetch('/save_new_method', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ textTitle: title, textDescription: description, input: userInput}),
        })
        .then(response => response.text())
        .then(data => {
            // Handle the response if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


function cancelNeueMethode() {
    customPopupAbNew.style.display = 'none';
}


function methodeLöschen() {
    var customPopupAb = document.getElementById('customPopupAb');
    var deleteButton = document.getElementById('methode-löschen');

    // Declare confirmPopup in the outer scope
    var confirmPopup;

    confirmPopup = document.getElementById('popupLöschen');

    // Display the confirmation popup
    confirmPopup.style.display = 'block';
    confirmPopup.style.position = 'fixed';
    confirmPopup.style.padding = '15%';
    confirmPopup.style.zIndex = '1001';

    var confirmYesButton = document.getElementById('confirmYesDelete');
    var confirmNoButton = document.getElementById('confirmNoDelete');

    // Confirm No button functionality
    confirmNoButton.onclick = function () {
        // Check if confirmPopup is defined before using it
        if (confirmPopup) {
            confirmPopup.style.display = 'none';
        }
    };

    // Confirm Yes button functionality
    confirmYesButton.onclick = function () {
        // Check if confirmPopup is defined before using it
        if (confirmPopup) {
            confirmPopup.style.display = 'none';
        }

        customPopupAb.style.display = 'none';

        var methodenName = document.getElementById('title-textarea').value;

        // Methode im GUI löschen
        function findElementByTextContent(text) {
            var boxElements = document.querySelectorAll('.abreicherung-box');

            for (var i = 0; i < boxElements.length; i++) {
                var element = boxElements[i];

                // Check if the text content of the element contains the specified text
                if (element.textContent.includes(text)) {
                    // Remove the parent <div> of the found element
                    var parentDiv = element.closest('div');
                    parentDiv.style.display = 'none';
                    return; // Exit the loop once a matching element is found and removed
                }
            }
        }

        // Use the custom function to find the element
        findElementByTextContent(methodenName);

        // Update database
        updateDatabase(methodenName);
    };

    function updateDatabase(title) {
        var userInput = document.getElementById('user-input').value;
        fetch('/delete_method', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({textTitle: title, input: userInput}),
        })
        .then(response => response.text())
        .then(data => {
            // Handle the response if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function deleteEntry() {
    var popupDeleteEntry = document.getElementById('popupEintragLöschen')

    popupDeleteEntry.style.display = 'block';
    popupDeleteEntry.style.position = 'fixed';
    popupDeleteEntry.style.padding = '15%';
    popupDeleteEntry.style.zIndex = '1001';

    var cancelDelete = document.getElementById('doNotDelete');
    cancelDelete.onclick = function() {
        popupDeleteEntry.style.display = 'none';
    }

    var confirmDeleteEntry = document.getElementById('confirmDelete')
    confirmDeleteEntry.onclick = function() {
        var deleteInput = document.getElementById('deleteCheck').value;
        if (deleteInput === 'Dodos are the best') {
            //finallyDeleteEntry();
            popupDeleteEntry.style.display = 'none';

            deleteEntryDatabase();
            location.reload();
        }
    }

    function deleteEntryDatabase() {
        var userInput = document.getElementById('user-input').value;
        fetch('/delete_entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({input: userInput}),
        })
        .then(response => response.text())
        .catch(error => {
            console.error('Error:', error);
        });        
    }
}