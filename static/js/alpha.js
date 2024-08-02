/*
Hallo Dodo-Fans,
dieses Skript enthält alle Funktionen, die bei Interaktionen mit dem Webbrowser (mit alpha.html erstellt) ausgeführt werden.
*/


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


// Funktionalität, bei der auf der Seite Buchstaben-Schaltflächen von A bis Z vorhanden sind, und durch Klicken auf diese Schaltflächen Vorschläge aus dem Backend abgerufen und angezeigt werden
document.addEventListener("DOMContentLoaded", function() {
    // Ausführung des Codes nach vollständigem Laden des DOMs

    // Referenz zur Dodo-Sprechblase
    var infoAlpha = document.getElementById("infoAlpha");
    // Referenz zum html-Element, das die Vorschläge beinhaltet
    var container = document.getElementById('alpha-container');
    
    // Iteration über alle Buchstaben von A bis Z (Unicode-Werte der Großbuchstaben von A (65) bis Z (90))
    for (let charCode = 65; charCode <= 90; charCode++) {
        const letter = String.fromCharCode(charCode); // Konvertieren des Unicode-Werts in den entsprechenden Buchstaben
        const button = document.getElementById(`btn${letter}`); // Selektieren des Buttons für den aktuellen Buchstaben

        // Erstellen von Klick-Event für jeden Button
        button.addEventListener("click", function() {
            // Leeren des Containers (Element, das Vorschläge beinhaltet)
            container.innerHTML = '';
            // POST-Anfrage an /get_alpha_suggestions senden
            fetch('/get_alpha_suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Der aktuelle Buchstabe wird als JSON im Body der Anfrage gesendet
                body: JSON.stringify({ letter: letter })
            })
            .then(response => response.json())
            .then(data => {
                // Die Antwort wird als JSON geparst und die Vorschläge werden in der suggestions-Variablen gespeichert
                var suggestions = data.suggestions;

                // Wenn Vorschläge vorhanden sind, wird die Dodo-Nachricht angezeigt und positioniert. Andernfalls wird es ausgeblendet
                if (suggestions.length !== 0) {
                    infoAlpha.style.display = 'block';
                    infoAlpha.style.position = 'fixed';
                    infoAlpha.style.bottom = '0';
                    infoAlpha.style.paddingBottom = '100px';
                    infoAlpha.style.zIndex = '1001';
                } else {
                    infoAlpha.style.display = 'none';
                }

                // Erstellen und Anzeigen des Buchstabens + Styling
                const letterTitle = document.createElement('p');
                letterTitle.innerHTML = letter;
                letterTitle.style.color = '#8CBDB9';
                letterTitle.style.fontSize = '60px';
                letterTitle.style.fontWeight = 'bold';
                letterTitle.style.paddingRight = '20px';
                // Hinzufügen zum Container
                container.appendChild(letterTitle);

                // Erstellen und Aufteilen der Vorschläge in zwei Spalten: Zwei <ul>-Elemente werden erstellt und zum Container hinzugefügt, um die Vorschläge in zwei Spalten zu unterteilen
                let ul1 = document.createElement('ul');
                ul1.classList.add('column');
                let ul2 = document.createElement('ul');
                ul2.classList.add('column');

                container.appendChild(ul1);
                container.appendChild(ul2);

                // Berechnung der Anzahl an Vorschlägen für jede Spalte, damit diese gleichmäßig über die beiden Spalten verteilt sind
                const halfLength = Math.ceil(suggestions.length / 2);
                const firstHalf = suggestions.slice(0, halfLength);
                const secondHalf = suggestions.slice(halfLength);

                // Hinzufügen der Vorschläge zu den Spalten
                // Die Vorschläge der ersten Hälfte werden zur ersten Spalte (ul1) hinzugefügt
                firstHalf.forEach(entry => {
                    // Erstellen von Listenunterpunkt
                    let li = document.createElement('li');
                    // Erstellen von Link für den Vorschlag
                    let link = document.createElement('a');
                    // Parametername dem Element hinzufügen
                    link.innerHTML = entry;
                    // Hinzufügen von Klasse für Styling
                    link.classList.add('p4');
                    // Setzen des Links auf die Sartseite
                    link.href = '/';
                    // Anhängen des Link-Elemennts an das Listenelement
                    li.appendChild(link);
                    // Anhängen des Listenelements an die erstellte ungeordnete Liste
                    ul1.appendChild(li);
                    // Hinzufügen einer Funktionaliät beim Klicken auf den Vorschlag -> Ausführung der Funktion linkClicked (Beschreibung s. unten)
                    link.addEventListener('click', function(event) {
                        linkClicked(event, entry);
                    });
                });

                // Dasselbe für die 2. Spalte
                secondHalf.forEach(entry => {
                    let li = document.createElement('li');
                    let link = document.createElement('a');
                    link.innerHTML = entry;
                    link.classList.add('p4');
                    link.href = '/';
                    li.appendChild(link);
                    ul2.appendChild(li);
                    link.addEventListener('click', function(event) {
                        linkClicked(event, entry);                        
                    });
                });

            })
            .catch(error => {
                console.error(error);
            });
        });
    }
});

// Setzen von Eintrag im localStorage mit dem Schlüssel "link" und dem Wert "false" -> für Überprüfung, ob ein Link angeklickt wurde
localStorage.setItem("link", "false");

// Funktion zum Speichern von Informationen im localStorage
function linkClicked(event, entry) {
    // Speichern, dass Link angeklickt wurde
    localStorage.setItem("link", "true");
    // Speichern des Parameternamens, das angeklickt wurde
    localStorage.setItem("inputParameter", entry);
}