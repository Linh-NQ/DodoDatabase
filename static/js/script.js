/*
Hallo Dodo-Fans,
dieses Skript enthält alle Funktionen, die bei Interaktionen mit dem Webbrowser (mit index.html erstellt) ausgeführt werden.
*/



/* 
Vorauswahl der Checkboxes
Auslösung von Event Listener, sobald das DOM vollständig geladen ist -> Das Skript wird nur ausgeführt, wenn alle Elemente im DOM verfügbar sind.
*/
document.addEventListener('DOMContentLoaded', function () {
    // Es werden alle Input-Elemente des Typs 'checkbox' ausgewählt.
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    // Iteration über die Checkboxen, um diese zu aktivieren
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = true;
    });
});


// Erstellen eines Dropdowns im Navigationsbereich
document.addEventListener("DOMContentLoaded", function() {
    // Speichern der Referenz zu "Parameter" im Navigationsbereich in eine Variable
    const parameterDropdown = document.getElementById("parameter-dropdown");
    // Speichern der Referenz zu dem Dropdown-Content von Parameter in eine Variable
    const parameterDropdownContent = document.getElementById("parameter-dropdown-content");
    // Speichern der Referenz zum Navigationsmenü in eine Variable
    const nav = document.querySelector("nav");

    // Hinzufügen eines Event Listeners: Wenn die Maus über "Parameter" im Navigationsbereich fährt, wird dem Dropdown-Content die Klasse "show" hinugefügt, und der Inhalt wird angezeigt.
    parameterDropdown.addEventListener("mouseenter", function() {
        parameterDropdownContent.classList.add("show");
    });

    // Wenn die Maus das Dropdown oder den Inhalt verlässt, wird nach einer kurzen Verzögerung (200ms) geprüft, ob sich die Maus noch über dem Dropdown. Wenn nicht, wird die Klasse show entfernt, und der Inhalt wird ausgeblendet.
    parameterDropdown.addEventListener("mouseleave", function() {
        setTimeout(function() {
            if (!parameterDropdownContent.matches(":hover")) {
                parameterDropdownContent.classList.remove("show");
            }
        }, 200);
    });

    // Derselbe Event Listener für den Dropdown-Inhalt
    parameterDropdownContent.addEventListener("mouseleave", function() {
        setTimeout(function() {
            if (!parameterDropdown.matches(":hover")) {
                parameterDropdownContent.classList.remove("show");
            }
        }, 200);
    });

    // Wenn die Maus den gesamten Navigationsbereich verlässt, wird die Klasse show sofort entfernt, um sicherzustellen, dass der Dropdown-Inhalt ausgeblendet wird.
    nav.addEventListener("mouseleave", function() {
        parameterDropdownContent.classList.remove("show");
    });
});


/*
Funktion zum Erstellen einer Box in der Kategorie Abreicherung
Box enthält Überschrift und Haupttext, der ein-und ausgeklappt werden kann.
Es werden die Argumente container (html-Element, in das die Box eingefügt wird) und entry (Objekt, das die Daten für die Box enthält) übergeben
*/
function createAbreicherungBox(container, entry) {
    // Erstellen eines div-Elements für die Box
    var box = document.createElement('div');
    // Hinzufügen der Klasse 'abreicherung-box' an das div-Element
    box.classList.add('abreicherung-box');

    // Erstellen eines h3-Elements für die Überschrift
    var header = document.createElement('h3');
    // Setzen des Textinhalts der Überschrift auf den Wert von 'Methodenname' im 'entry'-Objekt
    header.textContent = entry['Methodenname'];

    // Erstellen eines p-Elements für den Haupttext
    var mainText = document.createElement('p');
    // Setzen des Textinhalts auf den Wert von Methode im entry-Objekt
    mainText.textContent = entry['Methode'];
    // Hinzufügen der Klasse
    mainText.classList.add('full-text-collapsed');
    // Initially Verstecken des Elements
    mainText.style.display = 'none';

    // Hinzufügen der Überschrift und des Haupttextes in die Box
    box.appendChild(header);
    box.appendChild(mainText);

    // Erstellen eines Edit-Buttons mit dem Textinhalt 'Edit'
    var editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    // Hinzufügen von Klassen für Styling
    editButton.classList.add('edit-button', 'right-aligned');
    // Hinzufügen des Edit-Buttons in die Box
    box.appendChild(editButton);

    // Anfügen der Box an das html-Element container
    container.appendChild(box);

    // Positionierung des Edit-Buttons oben rechts in der Box
    editButton.style.position = 'absolute';
    editButton.style.top = '5px';
    editButton.style.right = '5px';

    // Hinzufügen der Klick-Funktionalität für die Box
    var isExpanded = false; // Initialisierung der Variable, um den Zustand der Box zu verfolfen

    // Hinzufügen eines Klick-Eventlisteners zur Box
    box.addEventListener('click', function () {
        // Wenn die Box erweitert ist, wird durch den Klick die Box verkleinert -> die Höhe der Box wird auf 50px gesetzt und der Haupttext wird versteckt
        if (isExpanded) {
            box.style.height = '50px';
            mainText.style.display = 'none';
        // Wenn die Box verkleinert ist, wird die Box durch Klick auf die volle Größe erweitert
        } else {
            // Anzeigen des Haupttexts
             mainText.style.display = 'block';

            // Berechnung der benötigten der Box, um den gesamten Inhalt anzeigen zu können
            var textHeight = mainText.scrollHeight;
            var headerHeight = header.scrollHeight;
            var totalTextHeight = textHeight + headerHeight + 40;
            box.style.height = totalTextHeight + 'px'; // Expand box
        }

        // Durch Klick wird der Zustand der Box geswitched
        isExpanded = !isExpanded;
    });

    // Hinzufügen der Klick-Funtionaliät zum Button 'Edit'
    editButton.addEventListener('click', function (event) {
        // Verhindern des Klick-Events des Box (wenn in die Box geklickt wird, wird jedes Mal das vorherige Event ausgeführt. Jedoch befindet sich der Edit-Button in der Box und beim Klick auf den Edit-Button soll nicht der Zustand der Box geändert werden, sonder eine andere Funktionalität ausgeführt werden)
        event.stopPropagation();

        // Öffnen eines benutzerdefiniertes Bearbeitungs-Popup (openCustomEditPopup), das die entry-Daten und eine Callback-Funktion erhält
        openCustomEditPopup(entry, function (updatedContent) {
            // Aktualisiert den Textinhalt des Haupttexts mit dem bearbeiteten Inhalt (updatedContent), der von der Callback-Funktion zurückgegeben wird.
            mainText.textContent = updatedContent;
        });
    });
}


/* Funktion, die ein benutzerdefiniertes Bearbeitungs-Popup öffnet, es dem Benutzer ermöglicht, Änderungen vorzunehmen und diese zu bestätigen oder abzubrechen.
Das Popup dient zur Bearbeitung der Abreicherungsmethode
Es werden zwei Argumente an die Funktion übergeben:
entry: Objekt, das die zu bearbeitenden Daten enthält
callback: Funktion, die nach dem Bestätigen der Änderungen aufgerufen wird
*/
function openCustomEditPopup(entry, callback) {
    // Speichern der Referenzen zu den relevanten html-Elementen in Variablen
    var popup = document.getElementById('customPopupAb'); // Popup für die Textbearbeitung
    var confirmPopup = document.getElementById('customPopupMethode'); // Popup zum Bestätigen, dass gespeichert werden soll
    var titleTextarea = document.getElementById('title-textarea'); // Überschrift der Abreicherungsmethode
    var descriptionTextarea = document.getElementById('description-textarea'); // Haupttext
    var saveButton = document.getElementById('methode-speichern'); // Button zum Speichern
    var cancelButton = document.getElementById('methode-cancel'); // Button zum Canceln
    var confirmYesButton = document.getElementById('confirmYesMethode'); // Button zum Bestätigen, dass gespeichert werden soll
    var confirmNoButton = document.getElementById('confirmNoMethode'); // Nein-Button, wenn nicht gespeichert werden soll

    // Setzt die initialen Werte der Textbereiche im Popup auf die Werte aus dem entry-Objekt
    titleTextarea.value = entry['Methodenname'];
    var oldTitle = entry['Methodenname'];
    descriptionTextarea.value = entry['Methode'];

    // Anzeigen des Popups und Styling
    popup.style.display = 'block';
    popup.style.position = 'fixed';
    popup.style.padding = '15%';
    popup.style.zIndex = '1000';
    popup.style.height = '1000px';

    // Funktionalität für den Speichern-Button
    saveButton.onclick = function () {
        // Beim Klicken auf die Speichern-Schaltfläche wird ein Bestätigungs-Popup angezeigt
        confirmPopup.style.display = 'block';
        confirmPopup.style.position = 'fixed';
        confirmPopup.style.padding = '15%';
        confirmPopup.style.zIndex = '1001';
    };

    // Funktionalität für den Ja-Button im Bestätigungs-Popup
    confirmYesButton.onclick = function () {
        // Beim Klick auf den Button wird ein Objekt erstellt, das die neuen Werte der Textbereiche enthält
        var updatedContent = {
            'Methodenname': titleTextarea.value,
            'Methode': descriptionTextarea.value
        };

        // Aufruf der Funktion (Beschreibung s. unten), um die Box mit den neuen Werten zu aktualisieren
        updateAbreicherungBox(entry, updatedContent);

        // Beide Popups werden ausgeblendet
        popup.style.display = 'none';
        confirmPopup.style.display = 'none';

        // Aufruf der Funktion (Beschreibung s. unten), um die Datenbank zu aktualisieren
        updateDatabase(titleTextarea.value, oldTitle, descriptionTextarea.value);
    };

    // Funktionalität für den Nein-Button im Bestätigungs-Popup
    confirmNoButton.onclick = function () {
        // Beim Klick auf den Button wird das Bestätigungs-Popup ausgeblendet
        confirmPopup.style.display = 'none';
    };

    // Funktionalität für den Cancel-Button im Bearbeitungs-Popup
    cancelButton.onclick = function () {
        // Beim Klick auf den Button wird der Popup ausgeblendet
        popup.style.display = 'none';
    };
}


/*
Funktion zum Aktualisieren der Inhalte einer bestehenden Box.
Es werden zwei Argumente an die Funktion übergeben:
entry: Objekt,  das die ursprünglichen Daten enthält, die zur Identifizierung der richtigen Box verwendet werden
updatedContent: Objekt, das die neuen Werte enthält, die in die Box eingefügt werden sollen
*/
function updateAbreicherungBox(entry, updatedContent) {
    // Wählt alle Elemente mit der Klasse abreicherung-box im Dokument aus und speichert sie in der Variablen boxes
    var boxes = document.querySelectorAll('.abreicherung-box');
    // Iterieren durch die Boxen
    for (var i = 0; i < boxes.length; i++) {
        // Auswählen des h3-Elements (Überschrift) der aktuellen Box aus
        var header = boxes[i].querySelector('h3');
        // Überprüfen, ob der Titel mit dem ursprünglichen Methodenname übereinstimmt
        if (header.textContent === entry['Methodenname']) {
            // Auswahl des p-Elements (Haupttext) der aktuellen Box
            var mainText = boxes[i].querySelector('p');
            // Aktualisierung des Textinhalts und der Überschrift mit den neuen Inhalten
            mainText.textContent = updatedContent['Methode'];
            header.textContent = updatedContent['Methodenname'];
            break; // Sobald die richtige Box gefunden und aktualisiert wurde, wird die Schleife mit break abgebrochen, um unnötige Iterationen zu vermeiden
        }
    }
}

/*
Funktion zum Aktualisieren der Datenbank: sendet eine POST-Anfrage an den Server, um eine bearbeitete Methode zu speichern.
Die Funktion nimmt zwei Argumente:
title: der bearbeitete Methodenname
description: die bearbeitete Methode
*/
function updateDatabase(title, oldTitle, description) {
    // Eingabewert des Users abrufen
    var userInput = document.getElementById('user-input').value;
    // Verwenden von Fetch API, um eine POST-Anfrage zu senden
    // Aufrufen der URL '/save_edited_method'
    fetch('/save_edited_method', {
        // POST-Methode, da daten gesendet werden
        method: 'POST',
        // Inhalt der Anfrage wird im JSON-Format gesendet
        headers: {
            'Content-Type': 'application/json',
        },
        /*
        Body der Anfrage enthält die Daten, die in JSON-Format übertragen werden
        JSON-Objekt enthält:
        textTitle: bearbeitete Methodenname
        textDescription: bearbeitete Methode
        input: Eingabewert des Benutzers
        oldMethodTitle: alte Methodenname, der zur Identifikation verwendet wird
        */
        body: JSON.stringify({ textTitle: title, textDescription: description, input: userInput, oldMethodTitle: oldTitle }),
    })
    .then(response => response.text()) // Wenn die Anfrage erfolgreich ist, wird die Antwort in Textform konvertiert
    .catch(error => {
        console.error('Error:', error); // Wenn ein Fehler auftritt, wird er in der Konsole protokolliert
    });
}


// Funktion zum Senden von Benutzereingaben an Server, der eine Python-Funktion ausführt, und zum Anzeigen der Ergebnisse im Webbrowser
function executePythonFunction() {
    // Verstecken von html-Elementen, die durch vorherige Suchen bereits schon angezeigt wurden
    document.querySelector('.infoNoEntries').style.display = 'none';
    document.querySelector('.infoSimilarEntries').style.display = 'none';
    document.getElementById("dodoCookie").style.display = 'none';
    document.getElementById("infoNoSearch").style.display = 'none';
    document.getElementById('theDodoTalks').style.display = 'none';

    // Abrufen des Werts aus dem Eingabefeld mit der ID user-input
    var userInput = document.getElementById('user-input').value;
    // Abrufen aller asugewählten Checkboxen, die den Namen 'category' haben und Extrahieren der Werte in ein Array
    var categories = Array.from(document.querySelectorAll('input[name=category]:checked')).map(checkbox => checkbox.value);

    // Überprüfung auf leere Eingabe
    if (userInput === '') {
        // Wenn keine Benutzereingabe vorhanden ist, wird eine Warnung angezeigt.
        var noInfo = document.getElementById("infoNoSearch");
        noInfo.style.display = 'block';
        noInfo.style.position = 'fixed';
        noInfo.style.bottom = '0';
        noInfo.style.paddingBottom = '100px';
        noInfo.style.zIndex = '1001';
    } else {
        // POST-Anfrage an den Server senden
        fetch('/execute-function', {
            // Senden der Benutzereingabe und der Kategorien als JSON-Objekt an die URL /execute-function
            method: 'POST',
            body: JSON.stringify({ input: userInput, categories: categories }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Verarbeitung der Serverantwort
            if (data === null) {
                // Für den Fall, dass keine Daten zurückgegeben wurden (da keine passenden Parameter in der Datenbank gefunden wurden), werden alle angezeigten Daten versteckt. Die Liste enthält IDs von html-Elementen, die momentan auf der Seite sichtbar sind
                ['allg-header', 'name-header', 'namen-header', 'abk-header', 'name', 'namen', 'abk','analytik-header', 'analytik-t-header', 'analytik-data', 'biochemie-header', 'mol_masse-header', 'aminos-header', 'oligo-header', 'glyko-header', 'bind-header', 'enzym-header', 'mol_masse', 'aminos', 'oligo', 'glyko', 'bind', 'enzym', 'funktionen-header', 'synth_gewebe-header', 'elek-header', 'immun-header', 'haupt-header', 'synth_gewebe', 'elek', 'immun', 'haupt', 'diagnostik-header', 'biomat-header', 'ref-header', 'hohe_werte-header', 'niedrige_werte-header', 'biomat', 'ref', 'hohe_werte', 'niedrige_werte', 'abreicherung-section', 'abr-header', 'deleteEntryButton'].forEach(cat => {
                    document.getElementById(cat).style.display = 'none';
                })

                // Dodo easter eggs messages (Die Messages werden unten auf der Seite fixiert)
                var dodoInfo = document.getElementById("dodoCookie");
                dodoInfo.style.display = 'block';
                dodoInfo.style.position = 'fixed';
                dodoInfo.style.bottom = '0';
                dodoInfo.style.paddingBottom = '100px';
                dodoInfo.style.zIndex = '1001';

                // Mögliche Nachrichten (können noch ergänzt werden)
                var possibleMessages = [
                    "Ich mag Kekse.",
                    "Das Dodo-Team hat sich Kekse verdient.",
                    "Hiii, wo sind meine Kekse?",
                    "KEKSE!",
                    "Als Belohnung nehme ich Kekse.",
                    "Lecker Kekse!"
                    ];

                // Eine zufällige Nachricht aus possibleMessages wird ausgewählt und im Element #dodoCookie .info-eintrag .p4 angezeigt.
                var pElement = document.querySelector('#dodoCookie .info-eintrag .p4');
                var randomIndex = Math.floor(Math.random() * possibleMessages.length);
                var randomMessage = possibleMessages[randomIndex];
                pElement.textContent = randomMessage;


                // Überprüfung auf ähnliche Parameter
                 fetch('/check_similar_parameter', {
                    // POST-Anfrage wird an den Server gesendet, um ähnliche Parameter zu finden
                    method: 'POST',
                    body: JSON.stringify({ input: userInput }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Speichern des html-Elements für die Anzeige, wenn keine Einträge vorhanden sind, in Variable
                    var infoNoEntries = document.querySelector('.infoNoEntries');
                    // Speichern des html-Elements für die Anzeige, wo ähnliche Parameter aufgelistet werden
                    var infoSimilarEntries = document.querySelector('.infoSimilarEntries');

                    // Falls keine passenden Parameter gefunden wurden, wird das entsprechende html-Element angezeigt
                    if (data.length === 0) {
                        infoNoEntries.style.display = 'block';                         
                    } else {
                        // Falls passende Parameter in der Datenbank gefunden wurden, werden diese aufgelistet
                        // Finden des ul-Elements und Speichern in Variable
                        var ul = infoSimilarEntries.querySelector('ul');
                        if (!ul) {
                            // Wenn kein ul-Element gefunden wird, wird ein neues ul-Element erstellt und dem infoSimilarEntries-Element hinzugefügt
                            ul = document.createElement('ul');
                            infoSimilarEntries.appendChild(ul);
                        }
                        while (ul.firstChild) {
                            // Solange das ul-Element noch Kind-Elemente (li) hat, werden diese entfernt. Dies sorgt dafür, dass die Liste leer ist, bevor neue Einträge hinzugefügt werden -> Somit werden Daten aus vorheriger Suche entfernt
                            ul.removeChild(ul.firstChild);
                        }

                        // Anzeigen des infoSimilarEntries-Elements
                        infoSimilarEntries.style.display = 'block';

                        // Für jeden Eintrag in der data-Liste wird ein neuer li-Knoten erstellt
                        data.forEach(entry => {
                            var li = document.createElement('li');
                            // Klasse p4 wird dem li-Element hinzugefügt
                            li.classList.add('p4');
                            // Textinhalt des li-Elements wird auf den aktuellen Eintrag gesetzt
                            li.textContent = entry;
                            // Styling
                            li.style.color = '#8CBDB9';
                            li.style.fontWeight = 'bold';
                            li.style.listStylePosition = 'inside';
                            // li-Element wird dem ul-Element hinzugefügt.
                            ul.appendChild(li);
                        });
                        // ul-Element wird dem infoSimilarEntries-Element hinzugefügt
                        infoSimilarEntries.appendChild(ul);
                    }
                })
        
            } else {
                // Für den Fall, dass der passende Parameter zum User Input gefunden wurde, werden die Daten angezeigt.
                // Anzeigen von den Daten aus der Kategorie 'allgemein'
                document.getElementById('allg-header').style.display = 'table-cell';
                document.getElementById('name-header').style.display = 'table-cell';
                document.getElementById('namen-header').style.display = 'table-cell';
                document.getElementById('abk-header').style.display = 'table-cell';
                document.getElementById('name').style.display = 'table-cell';
                document.getElementById('namen').style.display = 'table-cell';
                document.getElementById('abk').style.display = 'table-cell';
                // Füllen der Inhalte mit den entsprechenden Daten aus dem data-Objekt
                document.getElementById('name').textContent = data['Name'].name;
                document.getElementById('namen').textContent = data['Name'].namen;
                document.getElementById('abk').textContent = data['Name'].abk;
                // Delete-Button sichtbar machen
                document.getElementById('deleteEntryButton').style.display='flex'

                if (categories.includes('Analytik')) {
                    // Wenn Analytik ausgewählt wurde, befindet sich diese Kategorie in der Liste 'categories'
                    // Anzeigen der Überschriften
                    document.getElementById('analytik-header').style.display = 'table-cell';
                    document.getElementById('analytik-t-header').style.display = 'table-row';

                    // Speichern der html-Referenz für die Überschriften in eine Variable
                    var headerRow = document.getElementById('analytik-t-header');

                    // Hinzufügen der Klasse
                    headerRow.classList.add('special-header-row');

                    // Speichern der html-Referenz für die Analytik-Daten in eine Variable
                    var tableBody = document.getElementById('analytik-data');

                    // Leeren von vorherigen Daten
                    tableBody.innerHTML = '';

                    // Iteration über die Analytik-Daten, um die Webseite mit diesen Daten in Tabellenform zu füllen
                    if (Array.isArray(data['Analytik']) && data['Analytik'].length > 0) {
                        data['Analytik'].forEach(entry => {
                            // für jeden Eintrag wird ein neues tr-Element (Tabellenzeile) erstellt
                            var row = document.createElement('tr');
                            // Erstellen von neuer Zelle in einer Zeile für den name-Wert
                            var nameCell = document.createElement('td');
                            // Der textContent der Zelle wird auf den name-Wert des aktuellen Eintrags (entry) gesetzt
                            nameCell.textContent = entry['name'];
                            // Zelle wird der Zeile (<tr>) hinzugefügt
                            row.appendChild(nameCell);

                            // Eine neue Zelle für den labor-Wert wird erstellt, mit Daten gefüllt und der Zeile hinzugefügt
                            var laborCell = document.createElement('td');
                            laborCell.textContent = entry['labor'];
                            row.appendChild(laborCell);

                            // Eine neue Zelle für den name_labor-Wert wird erstellt, mit Daten gefüllt und der Zeile hinzugefügt
                            var labNameCell = document.createElement('td');
                            labNameCell.textContent = entry['name_labor'];
                            row.appendChild(labNameCell);

                            // Eine neue Zelle für den methode-Wert wird erstellt, mit Daten gefüllt und der Zeile hinzugefügt
                            var methodeCell = document.createElement('td');
                            methodeCell.textContent = entry['methode'];
                            row.appendChild(methodeCell);

                            // Eine neue Zelle für den messsystem-Wert wird erstellt, mit Daten gefüllt und der Zeile hinzugefügt
                            var messsystemCell = document.createElement('td');
                            messsystemCell.textContent = entry['messsystem'];
                            row.appendChild(messsystemCell);

                            // Eine neue Zelle für den hersteller-Wert wird erstellt, mit Daten gefüllt und der Zeile hinzugefügt
                            var herstellerCell = document.createElement('td');
                            herstellerCell.textContent = entry['hersteller'];
                            row.appendChild(herstellerCell);

                            // Eine neue Zelle für den preis-Wert wird erstellt, mit Daten gefüllt und der Zeile hinzugefügt
                            var preisCell = document.createElement('td');
                            preisCell.textContent = entry['preis'];
                            row.appendChild(preisCell);

                            // Eine neue Zelle für den datum-Wert wird erstellt, mit Daten gefüllt und der Zeile hinzugefügt
                            var datumCell = document.createElement('td');
                            datumCell.textContent = entry['datum'];
                            row.appendChild(datumCell);

                            // Hinzufügen spezieller Klassen zu den Zellen (jede Zelle erhält die CSS-Klasse special-cell)
                            laborCell.classList.add('special-cell');
                            labNameCell.classList.add('special-cell');
                            methodeCell.classList.add('special-cell');
                            messsystemCell.classList.add('special-cell');
                            herstellerCell.classList.add('special-cell');
                            preisCell.classList.add('special-cell');
                            datumCell.classList.add('special-cell');

                            // Hinzufügen der Zeile zum Tabellenkörper
                            tableBody.appendChild(row);
                        });
                    }

                    // Anzeigen des Tabellenkörpers
                    tableBody.style.display = 'table-row-group';
                } else {
                    // Falls die Analytik-Checkbox nicht angeklickt wurde, werden die Einträge nicht angezeigt
                    document.getElementById('analytik-data').style.display = 'none';
                    document.getElementById('analytik-header').style.display = 'none';
                    document.getElementById('analytik-t-header').style.display = 'none';
                }

                // Anzeigen der Biochemie-Daten, wenn die entsprechende Checkbox angekreuzt wurde
                if (categories.includes('Biochemie')) {
                    // Anzeigen der entsprechenden Tabellenzellen (Überschrift und Einträge)
                    ['biochemie-header', 'mol_masse-header', 'aminos-header', 'oligo-header', 'glyko-header', 'bind-header', 'enzym-header', 'mol_masse', 'aminos', 'oligo', 'glyko', 'bind', 'enzym'].forEach(cat => {
                        document.getElementById(cat).style.display = 'table-cell';
                    });

                    // Anzeigen der Biochemie-Daten (die Textinhalte der Tabellenzellen werden mit den entsprechenden Werten aus dem data-Objekt gefüllt)
                    document.getElementById('mol_masse').textContent = data['Biochemie']['Molekulare Masse'];
                    document.getElementById('aminos').textContent = data['Biochemie']['Aminosäuren'];
                    document.getElementById('oligo').textContent = data['Biochemie']['Oligomerisierung'];
                    document.getElementById('glyko').textContent = data['Biochemie']['Glykolisierung'];
                    document.getElementById('bind').textContent = data['Biochemie']['Bindungsmotiv'];
                    document.getElementById('enzym').textContent = data['Biochemie']['Enzymfunktion'];
                } else {
                    // Wenn die Biochemie-Checkbox nicht angeklickt wurde, werden die entsprechenden Tabellenzellen verborgen
                    ['biochemie-header', 'mol_masse-header', 'aminos-header', 'oligo-header', 'glyko-header', 'bind-header', 'enzym-header', 'mol_masse', 'aminos', 'oligo', 'glyko', 'bind', 'enzym'].forEach(cat => {
                        document.getElementById(cat).style.display = 'none';
                    });
                }

                // Gleicher Vorgang für die Funktion-Daten
                if (categories.includes('Funktion')) {
                    ['funktionen-header', 'synth_gewebe-header', 'elek-header', 'immun-header', 'haupt-header', 'synth_gewebe', 'elek', 'immun', 'haupt'].forEach(cat => {
                        document.getElementById(cat).style.display = 'table-cell';
                    });

                    document.getElementById('synth_gewebe').textContent = data['Funktion']['Synthetisierendes Gewebe'];
                    document.getElementById('elek').textContent = data['Funktion']['Elektrophorese'];
                    document.getElementById('immun').textContent = data['Funktion']['Immunsystem'];
                    document.getElementById('haupt').textContent = data['Funktion']['Hauptfunktion'];

                } else {
                    ['funktionen-header', 'synth_gewebe-header', 'elek-header', 'immun-header', 'haupt-header', 'synth_gewebe', 'elek', 'immun', 'haupt'].forEach(cat => {
                        document.getElementById(cat).style.display = 'none';
                    });
                }
            
                // Gleicher Vorgang für die Diagnostik-Daten
                 if (categories.includes('Diagnostik')) {
                    ['diagnostik-header', 'biomat-header', 'ref-header', 'hohe_werte-header', 'niedrige_werte-header', 'biomat', 'ref', 'hohe_werte', 'niedrige_werte'].forEach(cat => {
                        document.getElementById(cat).style.display = 'table-cell';
                    });

                    document.getElementById('biomat').textContent = data['Diagnostik']['Biomaterial'];
                    document.getElementById('ref').textContent = data['Diagnostik']['Referenzbereich'];
                    document.getElementById('hohe_werte').textContent = data['Diagnostik']['Erhöhte Werte'];
                    document.getElementById('niedrige_werte').textContent = data['Diagnostik']['Erniedrigte Werte'];
                } else {
                    ['diagnostik-header', 'biomat-header', 'ref-header', 'hohe_werte-header', 'niedrige_werte-header', 'biomat', 'ref', 'hohe_werte', 'niedrige_werte'].forEach(cat => {
                        document.getElementById(cat).style.display = 'none';
                    });
                }

                // Gleicher Vorgang für die Abreicherungsdaten
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
            // Ausgabe des Fehlers in Konsole bei Fehler
            console.error('Error:', error);
        });
    }
}


// Funktion zum Überwachen der Benutzeingaben und Erhalten + Anzeigen von Vorschlägen von Server
function showSuggestions() {
    // holt den Wert aus einem Eingabefeld mit der ID user-input, konvertiert ihn in Kleinbuchstaben und entfernt Leerzeichen am Anfang und Ende
    var userInput = document.getElementById('user-input').value.toLowerCase().trim();
    // Speichern der Referenz zu Dropdown in Variable
    var dropdown = document.getElementById('suggestions');
    // Speichern der Referenz zu Dodo-Text in Variable
    var dodoTalks = document.getElementById('theDodoTalks');

    if (userInput.length === 0) {
        // Wenn die Benutzereingabe leer ist, wird das Dropdown-Menü geleert und ausgeblendet
        dropdown.innerHTML = '';
        dropdown.style.display = 'none';
        return; // Ende der Funktion
    }

    // Senden von Anfrage (in JSON-Format) an Server, um Vorschläge zu erhalten
    fetch('/get-suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userInput })
    })
    .then(response => response.json())
    .then(data => {
        // Antwort des Servers wird in JSON konvertiert und in data gespeichert
        var suggestions = data.suggestions;

        // Die empfangenen Vorschläge werden gefiltert, um nur diejenigen anzuzeigen, die die Benutzereingabe enthalten
        var matchedSuggestions = suggestions.filter(function(suggestion) {
            return suggestion.toLowerCase().includes(userInput);
        });

        // Für jede gefilterte Übereinstimmung wird ein div-Element erstellt, das bei einem Klick die selectSuggestion()-Funktion mit dem ausgewählten Vorschlag aufruft
        var suggestionHTML = '';
        matchedSuggestions.forEach(function(suggestion) {
            suggestionHTML += '<div onclick="selectSuggestion(\'' + suggestion + '\')">' + suggestion + '</div>';
        });

        if (suggestionHTML !== '') {
            // Wenn es übereinstimmende Vorschläge gibt, wird das Dropdown-Menü mit diesen Vorschlägen gefüllt und angezeigt
            dropdown.innerHTML = suggestionHTML;
            dropdown.style.display = 'block';
            // Ausblenden der Dodo-Nachricht
            dodoTalks.style.display = 'none';
        } else {
            // Wenn keine Vorschläge gefunden wurden, wird das Dropdown-Menü geleert und ausgeblendet
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            // Einblenden der Dodo-Nachricht
            dodoTalks.style.display = 'block';present
        }
    })
    .catch(error => {
        console.error('Error fetching suggestions:', error);
    });
}


// Aufruf der Funktion, wenn ein Benutzer einen Vorschlag aus der Liste auswählt
function selectSuggestion(selectedValue) {
    // setzt den Wert des Eingabefeldes (mit der ID user-input) auf den ausgewählten Vorschlag (selectedValue)
    document.getElementById('user-input').value = selectedValue;
    // Dropdown-Menü ausblenden
    document.getElementById('suggestions').style.display = 'none';
}


// Funktion, um User Interface zu aktualisieren, wenn ein neuer Eintrag erstellt wird
function neuerEintrag() {
    // falls vorher gesucht wurde und keine Einträge vorhanden sind, muss die entsprechende Nachricht aus dem User Interface entfernt werden
    document.querySelector('.infoNoEntries').style.display = 'none';
    document.querySelector('.infoSimilarEntries').style.display = 'none';
    document.getElementById("dodoCookie").style.display = 'none';
    document.getElementById("infoNoSearch").style.display = 'none';

    // Ausblenden der html-Inhalte
    document.querySelector('.container2').style.display = 'none';
    document.querySelector('.container3').style.display = 'none';
    document.querySelector('.container4').style.display = 'none';

    // Anzeigen von Inhalten für die Erstellung des neuen Eintrags
    document.querySelector('.new-entry').style.display = 'flex';
    document.querySelector('.container5').style.display = 'flex';
}


// Funktion, um User Interface auf den ursprünglichen Zustand zurückzusetzen
function goBackToOriginal() {
    // Ausblenden der Dodo-Nachrichten
    document.getElementById("dodoEntryEmpty").style.display = 'none';
    document.getElementById("dodoEntryExists").style.display = 'none';
    document.getElementById("dodoEntrySpecial").style.display = 'none';

    // Einblenden der Container, die die Daten enthalten
    document.querySelector('.container2').style.display = 'flex';
    document.querySelector('.container3').style.display = 'flex';
    document.querySelector('.container4').style.display = 'flex';

    // Ausblenden der spezifischen Inhalte für die Erstellung eines neuen Eintrags
    document.querySelector('.new-entry').style.display = 'none';
    document.querySelector('.container5').style.display = 'none';
}


// Funktion zum Ausblenden der Dodo-Benachrichtigung, wenn der neue Eintrag bereits existiert 
function acceptInfoEntry() {
    var entryInfo = document.getElementById("dodoEntryExists");
    entryInfo.style.display = 'none';
}

// Funktion zum Ausblenden der Dodo-Benachrichtigung, wenn der Eintrag leer ist
function acceptInfoEmpty() {
    var entryInfo = document.getElementById("dodoEntryEmpty");
    entryInfo.style.display = 'none';
}

// Funktion zum Ausblenden der Dodo-Benachrichtigung, wenn der Eintrag nicht mit einem Buchstaben beginnt (sondern mit Sonderzeichen oder Zahl)
function acceptInfoSpecial() {
    var entryInfo = document.getElementById("dodoEntrySpecial");
    entryInfo.style.display = 'none';
}


// Funktion zum Überprüfen der Benutzereingabe + Anzeigen der entsprechenden Benachrichtigung + Überprüfen, ob Eintrag bereits existiert
function submitForm() {
    // Abrufen des Werts des Eingabefelds mit der ID new_name und Speichern in Variable
    var newName = document.getElementById("new_name").value;

    // Überprüfen, ob Bezeichnung mit einer Zahl oder einem Sonderzeichen anfängt
    if (/\d|[^\w]/.test(newName.charAt(0))) {
        // wenn Eingabe mit einem Sonderzeichen oder Zahl anfängt, wird das Element mit der ID dodoEntrySpecial angezeigt
        var dodoSpecial = document.getElementById('dodoEntrySpecial');
        dodoSpecial.style.display = 'block';
        dodoSpecial.style.position = 'fixed';
        dodoSpecial.style.bottom = '0';
        dodoSpecial.style.paddingBottom = '100px';
        dodoSpecial.style.zIndex = '1001';
    } else {
        // Wenn Eingabe mit einem Buchstaben beginnt, wird eine POST-Anfrage an den Server gesendet, um zu überprüfen, ob der Eintrag bereits existiert
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
                // Die Antwort des Servers wird als JSON geparst und überprüft, ob der Eintrag existiert (data.exists)
                if (data.exists) {
                    // Wenn der Eintrag existiert, wird das Element mit der ID dodoEntryExists angezeigt.
                    var entryInfo = document.getElementById("dodoEntryExists");
                    entryInfo.style.display = 'block';
                    entryInfo.style.position = 'fixed';
                    entryInfo.style.bottom = '0';
                    entryInfo.style.paddingBottom = '100px';
                    entryInfo.style.zIndex = '1001';
                                    
                } else {
                    // Falls der Eintrag nicht existiert, wird eine Funktion displayNewEntryMessage aufgerufen (Beschreibung der Funktion s. unten)
                    displayNewEntryMessage();
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            // Wenn die Eingabe leer ist, wird das Element mit der ID dodoEntryEmpty angezeigt
            var entryInfo = document.getElementById("dodoEntryEmpty");
            entryInfo.style.display = 'block';
            entryInfo.style.position = 'fixed';
            entryInfo.style.bottom = '0';
            entryInfo.style.paddingBottom = '100px';
            entryInfo.style.zIndex = '1001';
            return false;
        } 
    }
}

// Funktion zeigt eine Bestätigungsnachricht an, wenn ein neuer Eintrag erstellt werden soll. Wenn der Benutzer den Eintrag bestätigt, wird dieser in die Datenbank gespeichert.
function displayNewEntryMessage() {
    // Anzeigen des Bestätigungs-Popup
    var newEntrySave = document.getElementById('popupNeuerEintrag');
    newEntrySave.style.display = 'flex';

    // Speichern der html-Referenz für den Ja-Button in eine Variable
    var confirmYes = document.getElementById('confirmYesNewEntry');
    // Speichern der html-Referenz für den Nein-Button in eine Variable
    var confirmNo = document.getElementById('confirmNoNewEntry');

    // Funktionalität für den Nein-Button: Beim Klick wird die Bestätigungsnachricht ausgeblendet
    confirmNo.onclick = function() {
        newEntrySave.style.display = 'none';
    }

    // Funktionalität für den Ja-Button
    // Ebenfalls Ausblenden der Bestätigungsnachricht, wenn auf den Button geklickt wurde
    confirmYes.onclick = function() {
        newEntrySave.style.display = 'none';

        // Aufruf der Funktion, um Daten in die Datenbank zu speichern
        saveNewEntryDatabase()

        // Funktion zum Sammeln aller Werte in den Eingabefeldern und zum Senden dieser per fetch-API als POST-Anfrage an den Server
        function saveNewEntryDatabase(title, description) {
            // Speichern der Werte in den Eingabefeldern in Variablen
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

            // Senden der Daten an den Server
            // durch die /save_new_entry-Route werden die Daten in die Datenbank gespeichert
            fetch('/save_new_entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Übergeben der Daten als JSON-Objekt
                body: JSON.stringify({ paraName: name, paraNamen: weitereNamen, paraAbk: abk, molMasse: molmasse, aminoAcids: aminos, oligomerisierung: oligo, glykolisierung: glyko, bindMotiv: bind, enzymFunktion: enzym, synthGewebe: synthGew, elektrophorese: elek, immunsystem: immun, hauptfunktion: haupt, biomaterial: biomat, referenz:ref, hoheWerte: hoch, niedrigeWerte: niedrig,methodenName: methName, methode: meth}),
            })
            .then(response => response.text())
            .catch(error => {
                // Bei Fehler wird dieser in die Konsole ausgegeben
                console.error('Error:', error);
            });
        }

        // Nach dem Speichern wird die Seite neu geladen, um die Änderungen anzuzeigen
        location.reload();

    }
}


/*
Funktion zum Bearbeiten und Speichern von Daten in einer Section
Es werden zwei Argumente übergeben:
sectionId: ID für das html Element, das die Daten einer Kategorie (z. Bsp. Allgemein, Biochemie oder Diagnostik) beinhaltet
editButtonId: ID für den zugehörigen Edit-Button der Section
*/
function editSection(sectionId, editButtonId) {
    // Speichern der Referenz für den bearbeiteten Abschnitt in eine Variable
    var section = document.getElementById(sectionId);
    // Speichern der html-Referenzen (<td> ist Tabellenzelle), die die Daten in dem Abschnitt beinhalten, in eine Variable
    var dataCells = section.querySelectorAll('td');

    // Initialisierung der Variable zum Speichern der ursprünglichen Daten in dem Abschnitt
    var originalData = [];

    // Iteration über die html-Referenzen für die Daten des bearbeiteten Abschnitts
    dataCells.forEach(function (cell) {
        // Extrahieren des Textinhalts in eine Variable
        var text = cell.textContent;
        // Ergänzung des Arrays mit dem Textinhalt
        originalData.push(text);
        // für jede Tabellenzelle wird zum Bearbeiten ein Eingabe-Textfeld erstellt
        var input = document.createElement('textarea');
        // Das Eingabefeld bekommt den ursprünglichen Text
        input.value = text;
        // Leeren des Textinhalts der Zelle und Hinzufügen des Eingabefelds
        cell.textContent = '';
        cell.appendChild(input);
    });

    // Speichern aller textarea-Elemente im Abschnitt vor dem Bearbeiten
    var inputsBefore = section.querySelectorAll('textarea');
    // Extrahieren des 1. Elements, was dem Parameternamen entspricht
    var inputNameBefore = inputsBefore[0].value;

    // Ausblenden des Edit-Buttons im Bearbeitungsmodus
    var editButton = document.getElementById(editButtonId);
    editButton.style.display = 'none';

    // Erstellen eines Speichern-Buttons
    var saveButton = document.createElement('button');
    // Button bekommt den Textinhalt 'Save'
    saveButton.textContent = 'Save';
    // Hinzufügen der Klasse an den Button für Styling
    saveButton.classList.add('save-button');

    // Erstellen eines Cancel-Buttons
    var cancelButton = document.createElement('button');
    // Button bekommt den Textinhalt 'Cancel'
    cancelButton.textContent = 'Cancel';
    // Hinzufügen der Klasse an den Button für Styling
    cancelButton.classList.add('cancel-button');

    // Funktionalität für den Speichern-Button
    saveButton.onclick = function () {
        // Beim Klick werden vorherige Nachrichten im Webbroweser ausgeblendet
        var dodoMeckertDisplay = document.getElementById('dodoMeckert');
        dodoMeckertDisplay.style.display = 'none';
        var dodoSonderzeichenDisplay = document.getElementById('dodoSonderzeichen');
        dodoSonderzeichenDisplay.style.display = 'none';

        // Überprüfen, ob durch Änderung des Parameternamens ein anderer überschrieben wird
        // Speichern aller textarea-Elemente im Abschnitt nach dem Bearbeiten
        var inputsAfter = section.querySelectorAll('textarea');
        // Extrahieren des Parameternamens nach dem Bearbeiten
        var inputNameAfter = inputsAfter[0].value;

        // Überprüfung, ob der bearbeitete Abschnitt der Abschnitt Allgemein ist
        if (section.id === 'allgemein-section') {
            // Vergleich der Parameternamen vor und nach dem Bearbeiten
            if (inputNameBefore !== inputNameAfter) {
                // Bei Änderung des Namens wird eine Überprüfung (fetch-Aufruf) durchgeführt, ob der neue Name bereits existiert oder Sonderzeichen enthält
                fetch('/entry_double_check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ paraNameAfter: inputNameAfter }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        // falls durch die Namensänderung ein anderer Eintrag überschrieben wird, erscheint eine Meldung, damit dies nicht geschieht
                        dodoMeckertDisplay.style.display = 'block';
                    } else {
                        if (data.sonderzeichen) {
                            // falls der neue Parametername mit einem Sonderzeichen beginnt, erscheint eine Meldung, um den User darauf aufmerksam zu machen
                            dodoSonderzeichenDisplay.style.display = 'block';
                        } else {
                            // Bei nicht Überschreibung von bereits existierenden Einträgen und wenn der Parametername nicht mit einem Sonderzeichen anfängt, sind alle Kriterien erfüllt und die Funktion overwriteDatabase (Beschreibung s. unten) wird aufgerufen
                            overwriteDatabase();
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });                          
            } else {
                // hier wurde keine Änderung des Parameternamens durchgeführt -> keine weiteren Überprüfungen notwendig -> Aktualisierung der Datenbank
                overwriteDatabase();
            }
        } else {
            // hier handelt es sich nicht um den Abschnitt 'Allgemein', wodurch der Parametername unverändert bleibt -> keine weiteren Überprüfungen notwendig -> Aktualisierung der Datenbank 
            overwriteDatabase();
        }

        // Funktion zum Aktualisieren der Datenbank
        function overwriteDatabase() {
            // Erstellen und Anzeigen eines Bestätigungs-Popup
            var customPopupSave = document.getElementById('customPopup');
            customPopupSave.style.display = 'flex';

            // Speichern der Referenzen für den Ja- und Nein-Buttons in Variablen
            var confirmYes = document.getElementById('confirmYes');
            var confirmNo = document.getElementById('confirmNo');

            // Funktionalität für den Ja-Button
            confirmYes.onclick = function () {
                // Initialisieren eines Arrays zur Speicherung der Eingabewerte
                var input_values = []
                // Auswählen aller textarea-Elemente im Abschnitt
                var inputs = section.querySelectorAll('textarea');

                // Iterieren über die Eingabefelder und Aktualisieren der Anzeige im Webbrowser
                inputs.forEach(function (input, index) {
                    // Speichern des Eintrags mit dem entsprechenden Index in eine Variable
                    var cell = dataCells[index];
                    // Der neue Textinhalt des Eingabefeldes wird in die entsprechende Tabellenzelle geschrieben
                    cell.textContent = input.value;
                    // Der neue Wert wird in das input_values-Array eingefügt
                    input_values.push(input.value)
                });

                // Ausblenden des Speichern-Buttons
                saveButton.style.display = 'none';
                // Ausblenden des Cancel-Buttons
                cancelButton.style.display = 'none';
                // Wiederanzeigen des Edit-Buttons
                editButton.style.display = 'inline-block';
                // Ausblenden des Bestätigungs-Popup
                customPopupSave.style.display = 'none';

                // Aufrufen der Funktion zum Speichern der Daten in die Datenbank
                saveInDatabase()

                // Funktion sendet die neuen Daten an den Server, wo die Daten gespeichert werden
                function saveInDatabase(title, description) {
                    // Der Wert aus dem Eingabefeld wird ausgelesen und in eine Variable gespeichert
                    var userInput = document.getElementById('user-input').value;
                    // Einlesen der Alternativnamen
                    var weitereNamen = document.getElementById('namen').textContent;
                    // Einlesen der Abkürzungen
                    var abkuerzungen = document.getElementById('abk').textContent;
                    console.log(abkuerzungen);

                    // fetch-Aufruf, um POST-Anfrage an URL /save_in_database zu senden
                    fetch('/save_in_database', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // Anfrage enthält die Informationen Tabellenname in der Datenbank (entspricht dem bearbeiteten Abschnitt), bearbeiteten Einträge und dem User Input im Suchfeld (Parametername)
                        body: JSON.stringify({ tableName: sectionId, newEntries: input_values, input: userInput, namen: weitereNamen, abk: abkuerzungen}),
                    })
                    .then(response => response.text())
                    .catch(error => {
                        console.error('Error:', error);
                    });
                }
            };

            // Funktionalität für den Nein-Button
            confirmNo.onclick = function () {
                // Beim Klick auf den Button wird der Bestätigungs-Popup ausgeblendet
                customPopupSave.style.display = 'none';
            };            
        }
    };

    // Funktionalität für den Cancel-Button
    cancelButton.onclick = function () {
        // Beim Klick werden vorherige Nachrichten im Webbroweser ausgeblendet
        var dodoMeckertDisplay = document.getElementById('dodoMeckert');
        dodoMeckertDisplay.style.display = 'none';
        var dodoSonderzeichenDisplay = document.getElementById('dodoSonderzeichen');
        dodoSonderzeichenDisplay.style.display = 'none';

        // Daten werden resetted und Änderungen verworfen
        dataCells.forEach(function (cell, index) {
            cell.textContent = originalData[index];
        });

        // Ausblenden der Speichern- und Cancel-Buttons
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        // Wiedereinblenden des Edit-Buttons
        editButton.style.display = 'inline-block';

        // Ausblenden des Bestätigungspopups
        var customPopup = document.getElementById('customPopup');
        customPopupSave.style.display = 'none';
    };

    // Einfügen des cancel-Button direkt nach dem edit-Button
    editButton.parentNode.insertBefore(cancelButton, editButton.nextSibling);
    // Einfügen des save-Button direkt nach dem edit-Button (aber vor dem cancel-Button)
    editButton.parentNode.insertBefore(saveButton, editButton.nextSibling);
}


// Funktion zum Erstellen einer neuen Abreicherungsmethode
function neueMethode() {
    // Speichern der html-Referenz für das Bearbeitungs-Popup
    var customPopupAbNew = document.getElementById('customPopupAbNew');
    // Anzeigen des Bearbeitungspopup
    customPopupAbNew.style.display = 'block';
    customPopupAbNew.style.padding = '15%';

    // Speichern der html-Referenz für den Speichern-Button in eine Variable
    var saveButton = document.getElementById('methode-speichern-new');

    // Variable confirmPopup wird in einem äußeren Gültigkeitsbereich deklariert, um später darauf zugreifen zu können
    var confirmPopup;

    // Speichern-Button Funktionalität
    saveButton.onclick = function () {
        // Beim Klick wird das Element mit der gegebenen ID ausgewählt
        confirmPopup = document.getElementById('customPopupMethode');

        // Anzeigen des Bestätigungs-Popups
        confirmPopup.style.display = 'block';
        confirmPopup.style.position = 'fixed';
        confirmPopup.style.padding = '15%';
        confirmPopup.style.zIndex = '1001';
    };

    // Referenz für Ja-Button
    var confirmYesButton = document.getElementById('confirmYesMethode');
    //Referenz für Nein-Button
    var confirmNoButton = document.getElementById('confirmNoMethode');

    // Nein-Button Funktionalität
    confirmNoButton.onclick = function () {
        // Beim Klick auf den Button wird das Bestätigungs-Popup geschlossen
        if (confirmPopup) {
            confirmPopup.style.display = 'none';
        }
    };

    // Ja-Button Funktionalität
    confirmYesButton.onclick = function () {
        // Beim Klick auf den Button wird das Bestätigungs-Popup geschlossen
        if (confirmPopup) {
            confirmPopup.style.display = 'none';
        }

        // Abrufen der Eingabewerte und Speichern des Textinhalts in Variablen
        // Methodenname
        var methodenName = document.getElementById('default-title-textarea').textContent;
        // Methodenbeschreibung
        var methode = document.getElementById('default-description-textarea').textContent;

        // Erstellen eines Objekts, das die abgerufenen Werte speichert
        var entry = {
            'Methodenname': methodenName,
            'Methode': methode
            };

        // Erstellen und Hinzufügen einer neuen Box mit den neuen Eingabewerten
        var container = document.getElementById('abreicherung-boxes');
        createAbreicherungBox(container, entry);

        // Ausblenden des Bearbeitungs-Popup
        customPopupAbNew.style.display = 'none';

        // Aufruf der Funktion zum Aktualisieren der Datenbank
        updateDatabaseSave(methodenName, methode);

    };

    // Funktion aktualisiert Datenbank
    function updateDatabaseSave(title, description) {
        // Extrahieren des Paramternamens
        var userInput = document.getElementById('user-input').value;
        // fetch-Aufruf, um POST-Anfrage an URL /save_new_method zu senden
        fetch('/save_new_method', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Erstellen eines JSON-Körpers, das den Namen der Abreicherungsmethode, die Beschreibung und den Parameternamen enthält
            body: JSON.stringify({ textTitle: title, textDescription: description, input: userInput}),
        })
        .then(response => response.text())
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


// Funktionalität für den Cancel-Button
function cancelNeueMethode() {
    // Ausblenden des Bearbeitungs-Popup
    customPopupAbNew.style.display = 'none';
}


// Funktion zum Löschen einer Abreicherungsmethode aus der Datenbank
function methodeLöschen() {
    // Speichern der Referenz zum Bearbeitungs-Popup in Variable
    var customPopupAb = document.getElementById('customPopupAb');
    // Referenz zum Löschbutton
    var deleteButton = document.getElementById('methode-löschen');

    // Bestätigungs-Popup zum Löschen
    var confirmPopup = document.getElementById('popupLöschen');
    // Anzeigen und Styling des Popups
    confirmPopup.style.display = 'block';
    confirmPopup.style.position = 'fixed';
    confirmPopup.style.padding = '15%';
    confirmPopup.style.zIndex = '1001';

    // Referenz zu Ja-Button im Bestätigungs-Popup
    var confirmYesButton = document.getElementById('confirmYesDelete');
    // Referenz zu Nein-Button im Bestätigungs-Popup
    var confirmNoButton = document.getElementById('confirmNoDelete');

    // Funktionalität für den Nein-Button
    confirmNoButton.onclick = function () {
        if (confirmPopup) {
            // Ausblenden des Bestätigungs-Popups
            confirmPopup.style.display = 'none';
        }
    };

    // Funktionalität für den Ja-Button
    confirmYesButton.onclick = function () {
        if (confirmPopup) {
            // Ausblenden des Bestätigungs-Popups
            confirmPopup.style.display = 'none';
        }

        // Ausblenden des Bearbeitungs-Popup
        customPopupAb.style.display = 'none';

        // Referenz zu Name der Abreicherungsmethode
        var methodenName = document.getElementById('title-textarea').value;

        // Anzeige im Webbrowser aktualisieren -> Entfernen der gelöschten Abreicherungsmethode
        // Funktion zum Finden eines html-Elements anhand seines Textinhalts und Verstecken von dessen übergeordneten div-Elements, das der Abreicherungsmethode entspricht, die gelöscht werden soll
        function findElementByTextContent(text) {
            // Auswahl aller Elemente mit der bestimmten Klasse
            var boxElements = document.querySelectorAll('.abreicherung-box');

            // Iteration über die ausgewählten Elemente
            for (var i = 0; i < boxElements.length; i++) {
                // Speichern des aktuellen Elements in Variable
                var element = boxElements[i];

                // Überprüfung, ob der Textinhalts des aktuellen Elements den angegebenen Text enthält
                if (element.textContent.includes(text)) {
                    // Verstecken des übergeordneten <div>-Elements
                    var parentDiv = element.closest('div');
                    parentDiv.style.display = 'none';
                    return;
                }
            }
        }

        // Aufrufen der Funktion
        findElementByTextContent(methodenName);

        // Datenbank wird nach dem Löschen der Abreicherungsmethode aktualisiert
        updateDatabaseDelete(methodenName);
    };

    // Funktion zum Senden einer Anfrage an den Server, damit die Abreicherungsmethode gelöscht und die Datenbank aktualisiert wird wird
    function updateDatabaseDelete(title) {
        // Abrufen des User Inputs
        var userInput = document.getElementById('user-input').value;
        // Senden einer POST-Anfrage
        fetch('/delete_method', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Umwandlung der Daten (Name der Abreicherungsmethode und Parametername) in JSOM-Format
            body: JSON.stringify({textTitle: title, input: userInput}),
        })
        .then(response => response.text())
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


// Funktion zum Löschen eines Eintrages
function deleteEntry() {
    // Anzeigen des Bestätigungs-Popups
    var popupDeleteEntry = document.getElementById('popupEintragLöschen')
    popupDeleteEntry.style.display = 'block';
    popupDeleteEntry.style.position = 'fixed';
    popupDeleteEntry.style.padding = '15%';
    popupDeleteEntry.style.zIndex = '1001';

    // Zurück-Button
    var cancelDelete = document.getElementById('doNotDelete');
    // Beim Klick auf den Zurück-Button wird das Bestätigungs-Popup ausgeblendet
    cancelDelete.onclick = function() {
        popupDeleteEntry.style.display = 'none';
    }

    // Löschbutton
    var confirmDeleteEntry = document.getElementById('confirmDelete')
    // Klick-Funktionalität für den Button
    confirmDeleteEntry.onclick = function() {
        // Referenz zum Eingabefeld
        var deleteInput = document.getElementById('deleteCheck').value;
        // Überprüfen, ob Wert im Eingabefeld dem Text entspricht
        if (deleteInput === 'Dodos are the best') {
            //Ausblenden des Bestätigungs-Popups
            popupDeleteEntry.style.display = 'none';
            // Aufruf der Funktion zum Löschen des Eintrags (Funktionsbeschreibung s. unten)
            deleteEntryDatabase();
            // Seite neu laden
            location.reload();
        }
    }

    // Löschen des Eintrags in der Datenbank
    function deleteEntryDatabase() {
        // Extrahieren des Parameternamens
        var userInput = document.getElementById('user-input').value;
        // Senden einer POST-Anfrage an den Server und Aufrufen der entsprechenden URL
        fetch('/delete_entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Konvertieren des User Inputs (=Parametername) in JSON
            body: JSON.stringify({input: userInput}),
        })
        .then(response => response.text())
        .catch(error => {
            console.error('Error:', error);
        }); 
    }
}



// Navigieren auf Startseite und Ausführen von Aktionen, nachdem auf der Seite alpha.html ein Link angeklickt wurde
// Abrufen von Daten aus localStorage
var link = localStorage.getItem("link"); // speichert ein Flag (true oder false), das angibt, ob auf einen speziellen Link geklickt wurde
var inputParameter = localStorage.getItem("inputParameter"); // speichert Parameternamen
// Prüfen, ob ein Link angeklickt wurde
if (link==='true') {
    // Warten, bis das DOM vollständig geladen ist
    document.addEventListener("DOMContentLoaded", function() {
        // Referenz zum Eingabefeld in der Suchleiste
        var userInput = document.getElementById('user-input');
        // Setzen des Parameternamens in das Eingabefeld
        userInput.value = inputParameter;
        // Ausführen der Funktion zum Suchen und Anzeigen der Daten zum Parameter
        executePythonFunction();
        // Zurücksetzen des Flags in localStorage
        localStorage.setItem("link", "false");
    });

}