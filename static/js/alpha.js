
// Dropdown bei Parameter-Anzeige
document.addEventListener("DOMContentLoaded", function() {
    const parameterDropdown = document.getElementById("parameter-dropdown");
    const parameterDropdownContent = document.getElementById("parameter-dropdown-content");
    const nav = document.querySelector("nav");

    parameterDropdown.addEventListener("mouseenter", function() {
        parameterDropdownContent.classList.add("show");
    });

    parameterDropdown.addEventListener("mouseleave", function() {
        setTimeout(function() {
            if (!parameterDropdownContent.matches(":hover")) {
                parameterDropdownContent.classList.remove("show");
            }
        }, 200); // Adjust the delay time as needed
    });

    parameterDropdownContent.addEventListener("mouseleave", function() {
        setTimeout(function() {
            if (!parameterDropdown.matches(":hover")) {
                parameterDropdownContent.classList.remove("show");
            }
        }, 200); // Adjust the delay time as needed
    });

    nav.addEventListener("mouseleave", function() {
        parameterDropdownContent.classList.remove("show");
    });
});


document.addEventListener("DOMContentLoaded", function() {
    var infoAlpha = document.getElementById("infoAlpha");
    var container = document.getElementById('alpha-container');
    
    // Schleife durch alle Buchstaben von A bis Z
    for (let charCode = 65; charCode <= 90; charCode++) {
        const letter = String.fromCharCode(charCode); // Konvertiere den Unicode-Wert in den entsprechenden Buchstaben
        const button = document.getElementById(`btn${letter}`); // Selektiere den Button für den aktuellen Buchstaben

        button.addEventListener("click", function() {
            // Select the container element
            container.innerHTML = '';
            fetch('/get_alpha_suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ letter: letter })
            })
            .then(response => response.json())
            .then(data => {
                var suggestions = data.suggestions; // Fetched suggestions from the backend

                // Dodo spricht
                if (suggestions.length !== 0) {
                    infoAlpha.style.display = 'block';
                    infoAlpha.style.position = 'fixed';
                    infoAlpha.style.bottom = '0';
                    infoAlpha.style.paddingBottom = '100px';
                    infoAlpha.style.zIndex = '1001';
                } else {
                    infoAlpha.style.display = 'none';
                }

                const letterTitle = document.createElement('p');
                letterTitle.innerHTML = letter;
                letterTitle.style.color = '#8CBDB9';
                letterTitle.style.fontSize = '60px';
                letterTitle.style.fontWeight = 'bold';
                letterTitle.style.paddingRight = '20px';

                container.appendChild(letterTitle);

                // Create and append unordered list for suggestions
                let ul1 = document.createElement('ul');
                ul1.classList.add('column');
                let ul2 = document.createElement('ul');
                ul2.classList.add('column');

                container.appendChild(ul1);
                container.appendChild(ul2);

                // Calculate the number of suggestions for each column
                const halfLength = Math.ceil(suggestions.length / 2);
                const firstHalf = suggestions.slice(0, halfLength);
                const secondHalf = suggestions.slice(halfLength);

                // Append first half of suggestions to the first column
                firstHalf.forEach(entry => {
                    let li = document.createElement('li');
                    let link = document.createElement('a');
                    link.innerHTML = entry;
                    link.classList.add('p4');
                    link.href = '/'; // Set the link URL
                    li.appendChild(link);
                    ul1.appendChild(li);
                    link.addEventListener('click', function(event) {
                        linkClicked(event, entry);
                        localStorage.setItem("inputParameter", entry);
                    });
                });

                // Append second half of suggestions to the second column
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
                        localStorage.setItem("inputParameter", entry);
                    });
                });

            })
            .catch(error => {
                console.error(error);
            });
        });
    }
});


localStorage.setItem("link", link);
var link = false;
function linkClicked(event, entry) {
    link = true;
}



