#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd # Erstellung von Dataframes & Ausführung von SQL-Abfragen
from sqlalchemy import create_engine # Einrichtung der Verbindung zur Datenbank
# Beim Installieren darauf achten, dass manche pandas und sqlalchemy Versionen nicht miteinander kompatible sind
import sqlite3 # SQL-Abfragen in sqlite
import glob # Finden von Dateien in Ordnerstruktur
import os # Verbindung zu Betriebssystem (Verwaltung und Finden von Dateien)
import regex # reguläre Ausdrücke (z. Bsp. Finden von ähnlich geschriebenen Parameternamen)

from flask import Flask, request, jsonify, render_template
# Flask: Erstellung einer Instanz einer Flask-Anwendung und Starten der Anwendung
# Flask = Server-Software, die HTTP-Anfragen des Clients empfängt
# (Interaktionen in der Webanwendung und Ausführung von Aktionen)
# request: Bearbeiten der Daten in der Anfrage auf Serverseite
# jsonify: Umwandlung von Python-Objekten in JSON-Objekten, das an den Client als Antwort gesendet wird
# render_template: Rendern von HTML-Templates an Client

import tempfile
from datetime import datetime


# In[2]:


# Allgemeine Funktion
# Datumsformat anpassen
def convert_date(date_obj):
    if isinstance(date_obj, str):
        try:
            # Versuchen, das Datum im Format 'YYYY-MM-DD HH:MM:SS' zu parsen
            parsed_date = datetime.strptime(date_obj, "%Y-%m-%d %H:%M:%S")
            # In das gewünschte Format umwandeln
            return parsed_date.strftime("%d.%m.%Y")
        except ValueError:
            # Falls ein ValueError auftritt, Datum unverändert zurückgeben
            return date_obj
    elif isinstance(date_obj, datetime):
        # Wenn es sich bereits um ein datetime-Objekt handelt, ins gewünschte Format umwandeln
        return date_obj.strftime("%d.%m.%Y")
    else:
        # Für andere Fälle (z.B. keine Datumswerte) unverändert zurückgeben
        return date_obj


# In[3]:


# Chatbot
from transformers import pipeline, Conversation, AutoModelForCausalLM, AutoTokenizer
# pipeline: Verwendung vortrainierter Sprachmodelle
# Conversation: Verwaltung der Konversationen (Speichern)
# AutoModelForCausalLM & AutoTokenizer: Laden von vortrainierten Sprachmodellen für Verwendung von
# Kausalmodellierungen (Erzeugen von Texten im gegebenen Kontext)

model_name = "dbmdz/german-gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Setze den pad_token_id auf eos_token_id
# fügt zusätzliche Pads (Lückenfüller) in Eingabesequenz hinzu, wenn Eingabesequenz kürzer ist
# als maximale Länge.
# Einfügen von Pads notwendig, da Transformer-Modelle Eingabesequenzen mit fester Länge erwarten
# -> Standardisierung der Eingabesequenzen
tokenizer.pad_token_id = tokenizer.eos_token_id

# Initialisierung des Pipelines für Konversationen
chatbot_pipeline = pipeline("conversational", model=model, tokenizer=tokenizer)

# Helfer-Funktion zum Bereinigen der Antwort
def clean_response(response):
    # Entferne URLs und unnötige Wiederholungen
    # Entfernen von Anhängsel ".de/http://www.facebook.com/note.php?note_"
    response = response.split('.')[0]
    # Entfernen des User Inputs aus Antwort
    response = response.split('-')[-1].strip()
    return response

# Funktion zum Generieren der Antwort
def get_response(user_message, user_id):
    """ 
    Generiert Antwort des Chatbots
    
    Args:
        user_message (str): eingegebene Nachricht im Webbrowser
        user_id (str): zugeordnete ID für User
        
    Returns:
        str: Antwort des Chatbots
    """
    
    # Erstellen einer neuen Konversation oder Abrufen einer bestehenden
    conversation = Conversation()
    # Benutzerinput zur Konversation hinzufügen
    conversation.add_user_input(user_message)
    
    # Tokenizer-Optionen: Input text konvertieren
    inputs = tokenizer(user_message, return_tensors="pt", padding=True, truncation=True)
    
    # Generiert Antwort mithilfe des Modells
    outputs = model.generate(
        input_ids=inputs['input_ids'],
        # IDs der Tokens, die der Tokenizer aus dem Eingabetext generiert hat
        
        attention_mask=inputs['attention_mask'],
        # Signalisierung, dass bei gepaddeten Sequenzen Pads nicht in die Berechnung gezogen werden
        
        temperature=0.7,  # Temperatur für kreativere Antworten
        # (hoch -> kreativer, niedrig -> kohärenter)
        
        top_k=50,  # reduziert die Anzahl der nächsten Wörter, die das Modell in Betracht zieht, auf 50
        
        top_p=0.95,  # kleinste Menge an nächstmöglichen Wörtern,
        # deren kumulative Wahrscheinlichkeit mindestens p beträgt -> 
        # Ignorieren von weniger wahrscheinlichen Wörtern
        
        repetition_penalty=1.2, 
        # Strafe für Wiederholungen
        # (Wert > 1 bestraft Wiederholungen, Wert < 1 bevorzugt Wiederholungen)
        
        no_repeat_ngram_size=2,
        # Sequenzen von n aufeinanderfolgenden wiederholten Tokens verhindern
        
        num_beams=5,
        # Beam Search = Methode zur Suche nach dem besten Pfad durch die 
        # Wahrscheinlichkeitslandschaft, wobei mehrere Kandidatenpfade gleichzeitig verfolgt werden.
        # Anschließend wird der beste ausgewählt
        
        early_stopping=True 
        # Frühzeitiges Stoppen der Generierung der Tokens, wenn das Ende der
        # Eingabesequenz erreicht wird
    )
    
    # Dekodiere das generierte Token in Text
    response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Bereinigen der Antwort, um URLs und unsinnige Teile zu entfernen
    response_text = clean_response(response_text)

    return response_text


# In[11]:


# Initialisierung der Flask-Application
app = Flask(__name__)

# Definieren von Routen, um HTML-Vorlagen zu rendern -> Ausführung der verknüpften Funktion
# GET-Anfrage, um Daten vom Server abzurufen
# Startseite
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html') # Rendern der Datei im Standardverzeichnis "templates"

# Seite mit alphabetischer Anordnung der Parameter
@app.route('/alpha', methods=['GET'])
def alpha():
    return render_template('alpha.html')

# Seite mit Anordnung der Parameter nach Diagnostik
@app.route('/diagnostik', methods=['GET'])
def diagnostik():
    return render_template('diagnostik.html')


# Neue Route für Chatbot
# POST-Anfragen zum Senden der Daten an den Server
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json() # extrahiert JSON-Datenobkjekt der Anfrage
    
    # vom User gesendete Text, der im JSON-Feld 'text' vorhanden ist
    user_message = data['text']
    # eindeutige ID des Users im JSON-Feld 'user-id'
    user_id = data['user_id']
    # Generieren der Chatbot-Antwort mit zuvor definierter Funktion
    bot_response = get_response(user_message, user_id)
    # konvertiert Python-Objekt in JSON-Format, welches als Antwort zurückgesendet wird
    return jsonify({'bot_response': bot_response})
    


############ Interaktionen mit Datenbank (Hauptseite) ###############

# Absuchen der Datenbank nach User Input
def search_database(user_input, categories):
    """ 
    Sucht Datenbank nach eingegebenen Begriff im Suchfeld ab
    
    Args:
        user_input (str): Eingabe des Users im Suchfeld im Webbrowser
        categories (list): Liste aus Kategorien, die im Webbrowser ausgewählt wurden
        
    Returns:
        dict: Ergebnis der Datenbanksuche in allen Tabellen
    """

    # Verbindung zur Datenbank
    engine = create_engine("sqlite:///O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db")
    # Auswahl der Zeilen in der Tabelle namen, wo der Name des Parameters dem User Input entspricht
    # alles in Kleinschreibung, da User nicht immer Groß- und Kleinschreibung beachtet
    query = """SELECT * FROM namen
               WHERE LOWER(name) = LOWER(:user_input);"""
    # Ausgabe in Python in Form eines Dataframes
    table_name = pd.read_sql(query, engine, params={'user_input': user_input})
    if not table_name.empty: # wenn die Suche erfolgreich war, ist das Dataframe nicht leer
        # Überschreibung des User Inputs mit richtiger Klein- und Großschreibung
        user_input = table_name['name'][0]
    else:
        # wenn keine Identifizierung des User Inputs in der Spalte name möglich war, wird in der Spalte weitere_namen gesucht
        query = """SELECT * FROM namen
                    WHERE LOWER(weitere_namen) = LOWER(:user_input);"""
        # Ausgabe als Dataframe
        table_name = pd.read_sql(query, engine, params={'user_input': user_input})
        if not table_name.empty: # bei erfolgreicher Suche
            # Überschreiben des User Inputs mit dem richtigen eingetragenen Namen in der Datenbank
            user_input = table_name['name'][0]
        else:
            # Wenn immer noch keine Identifizierung des User Inputs möglich war, wird in der Spalte abkürzungen gesucht
            query = f"""SELECT * FROM namen
                        WHERE LOWER(abkürzungen) = LOWER(:user_input);"""
            # Ausgabe als Dataframe
            table_name = pd.read_sql(query, engine, params={'user_input': user_input})
            if not table_name.empty: # bei erfolgreicher Suche
                # Überschreiben des User Inputs mit dem richtigen eingetragenen Namen in der Datenbank
                user_input = table_name['name'][0]

    # Extrahieren der Daten bei erfolgreicher Suche in der Tabelle namen nach dem User Input
    if not table_name.empty:
        # Name, weitere Namen und Abkürzungen aus der gefilterten Tabelle entnehmen
        name = table_name['name'][0]
        namen = table_name['weitere_namen'][0]
        abk = table_name['abkürzungen'][0]

        # Ergebnis wird in ein Dictionary umgewandelt
        result = {'Name': {'name': name, 'namen': namen, 'abk': abk}}

        # Überprüfen, was bei den Checkboxen ausgewählt wurde
        # die Variable categories ist eine Liste von ausgewählten Kategorien

        # Kategorie Biochemie
        if 'Biochemie' in categories:
            # Auswählen der Daten in der Tabelle biochemie, wo der Name des Parameters dem User Input entspricht
            query = """SELECT * FROM biochemie
                        WHERE name = :user_input;"""
            # Ausgabe als Dataframe
            table_bio = pd.read_sql(query, engine, params={'user_input': user_input})
            # Daten der Tabelle werden in Variablen übergeben
            mol_masse = table_bio['molekulare_masse'][0]
            aminos = table_bio['aminosäuren'][0]
            oligo = table_bio['oligomerisierung'][0]
            glyko = table_bio['glykolisierung'][0]
            bind = table_bio['bindungsmotiv'][0]
            enzym = table_bio['enzymfunktion'][0]

            # Ergebnis der Suche wird in ein Dictionary umgewandelt
            biochemie = {'Molekulare Masse': mol_masse,
                        'Aminosäuren': aminos,
                        'Oligomerisierung': oligo,
                        'Glykolisierung': glyko,
                        'Bindungsmotiv': bind,
                        'Enzymfunktion': enzym}
            # Ergänzung des Endergebnis um biochemie
            result['Biochemie'] = biochemie

        # Kategorie Funktion (selbe Vorgehensweise wie zuvor)
        if 'Funktion' in categories:
            query = """SELECT * FROM funktionen
                        WHERE name = :user_input;"""
            table_func = pd.read_sql(query, engine, params={'user_input': user_input})
            synth_gewebe = table_func['synthetisierendes_gewebe'][0]
            elek = table_func['elektrophorese'][0]
            immun = table_func['immunsystem'][0]
            haupt = table_func['hauptfunktion'][0]
            funktion = {'Synthetisierendes Gewebe': synth_gewebe,
                       'Elektrophorese': elek,
                       'Immunsystem': immun,
                       'Hauptfunktion': haupt}
            result['Funktion'] = funktion

        # Kategorie Diagnostik (selbe Vorgehensweise wie zuvor)
        if 'Diagnostik' in categories:
            query = """SELECT * FROM diagnostik
                        WHERE name = :user_input;"""
            table_diag = pd.read_sql(query, engine, params={'user_input': user_input})
            biomat = table_diag['biomaterial'][0]
            ref = table_diag['referenzbereich'][0]
            hohe_werte = table_diag['erhöhte_werte'][0]
            niedrige_werte = table_diag['erniedrigte_werte'][0]
            diag = {'Biomaterial': biomat,
                   'Referenzbereich': ref,
                   'Erhöhte Werte': hohe_werte,
                   'Erniedrigte Werte': niedrige_werte}
            result['Diagnostik'] = diag

        # Kategorie Analytik
        # Vorgehensweise weicht zu vorher leicht ab, da hier ein Parameter mehrere Einträge in der Tabelle haben kann
        if 'Analytik' in categories:
            # Auswahl der Zeilen in der Tabelle Analytik, wo der Name des Parameters dem User Input entspricht
            query = """SELECT * FROM analytik
                        WHERE LOWER(name) = LOWER(:user_input)"""
            # Ausgabe als Dataframe
            table_ana = pd.read_sql(query, engine, params={'user_input': user_input})
            # Spalte 'name' wird durch Liste mit leeren Zeichenfolgen gesetzt (für Layout im Webbrowser)
            table_ana['name'] = ['']*len(table_ana)
            # Überprüfung, ob Dataframe leer ist
            if table_ana.empty:
                analytik_data = None
            # Rückgabe der Daten: Konvertierung des Dataframes in eine Liste von Dictionaries pro Zeile
            # jede Zeile wird zu einem Dictionary, wobei die Spaltennamen der Schlüssel sind
            analytik_data = table_ana.to_dict(orient='records')
            # Ergänzung des Endergebnis
            if analytik_data:
                result['Analytik'] = analytik_data

        # Kategorie Abreicherung (auch mehrere Einträge möglich)
        if 'Abreicherung' in categories:
            # Auswahl der Zeilen in der Tabelle Abreicherung, wo der Name des Parameters dem User Input entspricht
            query = """SELECT * FROM abreicherung
                        WHERE name = :user_input;"""
            # Ausgabe als Dataframe
            table_ab = pd.read_sql(query, engine, params={'user_input': user_input})

            abr = [] # Leere Liste wird mit Abreicherungsmethoden ergänzt
            for i in range(len(table_ab)):
                methodenname = table_ab['methodenname'][i]
                methode = table_ab['methode'][i]
                abr.append({'Methodenname': methodenname,
                            'Methode': methode})
            # Ergänzung des Endergebnis
            result['Abreicherung'] = abr

        # Rückgabe des Ergebnis
        return result


# Route, die POST-Anfragen (Daten werden an Server gesendet) entgegennimmt und verarbeitet
@app.route('/execute-function', methods=['POST'])
def execute_function():
    data = request.get_json() # Extraktion der JSON-Daten der Anfrage
    user_input = data['input'] # Extraktion des Wertes im Feld 'input'
    categories = data.get('categories', []) # Extraktion der Daten im Feld 'categories' in Form einer Liste
    categories.append('Name') # Ergänzung der Liste um Namen (notwendig, da Namen nicht als Checkbox im Webbrowser angezeigt wird, aber standardmäßig immer angezeigt wird)
    result = search_database(user_input, categories) # Aufruf der zuvor definierten Funktion
    return jsonify(result) # Konvertiert Ergebnis in JSON-Objekt


# Route zum Überprüfen von Ähnlichkeit des user Inputs mit gespeicherten Parametern in der Datenbank
@app.route('/check_similar_parameter', methods=['POST'])
def check_similar_parameter():
    data = request.get_json() # Extrahiert JSON-Daten aus Anfrage
    user_input = data['input'] # Extraktion des Wertes im Feld 'input'
    # Verbindung zur Datenbank
    engine = create_engine("sqlite:///O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db")
    # Query für Auswahl aller uniquen Einträge in der Tabelle namen
    query = """ SELECT DISTINCT * 
                FROM namen;"""
    parameter_liste = pd.read_sql(query, engine)['name'].tolist() # Liste mit allen Parameternamen
    parameter_liste_more = pd.read_sql(query, engine)['weitere_namen'].tolist() # Liste mit allen Namensergänzungen der Parameter
    parameter_liste_abk = pd.read_sql(query, engine)['abkürzungen'].tolist() # Liste mit allen Abkürzungen zu den Parametern
    possible_parameter = [] # Initialisierung der Liste, mit allen ähnlich geschriebenen Parameter wie User Input
    
    def check_match(anzahl, parameter, parameter_more, parameter_abk):
        """ 
        Sucht passende Parameter zum User Input aus.

        Args:
            anzahl (str): Anzahl der erlaubten Abweichungen an Zeichen zwischen dem User Input und Parameter
            parameter (str): Tatsächlicher Parametername
            parameter_more (str): Weiterer möglicher Parametername
            parameter_abk (str): Abkürzung des Parameters

        Returns:
            list: Liste mit passenden Parametern zum User Input
        """
        
        # Vergleich zwischen User Input und Parametername
        # Bei Übereinstimmung des Musters mit einem Parameternamen erhält man ein Match ;)
        match = regex.search(f'({user_input.lower()}{{e<{anzahl}}})', parameter.lower())
        if match:
            # Bei einem Match wird die Liste mit den passenden Parametern zum User Input ergänzt
            if match.group() != '':
                possible_parameter.append(parameter_liste[i])
        else:
            # selbe Suche unter den weiteren Parameternamen
            match = regex.search(f'({user_input.lower()}{{e<{anzahl}}})', parameter_more.lower())
            if match:
                if match.group() != '':
                    possible_parameter.append(parameter_liste[i] + ' (' + parameter_more + ' als weitere Bezeichnung(en))')
            else:
                # selbe Suche unter Abkürzungen
                match = regex.search(f'({user_input.lower()}{{e<{anzahl}}})', parameter_abk.lower())
                if match:
                    if match.group() != '':
                        possible_parameter.append(parameter_liste[i] + ' (' + parameter_abk + ' als Abk.)')    
        return match
    
    # Iteration über Liste mit allen Parameternamen, um nach Übereinstimmung mit User Input zu suchen
    for i in range(len(parameter_liste)):
        # Initialisierung des Matches
        match = False
        # Unterteilung nach Länge des User Inputs, da bei längeren Eingaben mehr Abweichungen erlaubt sind
        if len(user_input) < 4:
            match = check_match('2', parameter_liste[i], parameter_liste_more[i], parameter_liste_abk[i])
        elif (len(user_input) > 3) & (len(user_input) < 6):
            match = check_match('3', parameter_liste[i], parameter_liste_more[i], parameter_liste_abk[i])
        else:
            match = check_match('5', parameter_liste[i], parameter_liste_more[i], parameter_liste_abk[i])
    
    # Rückgabe der passenden Einträge zum User Input als JSON-Format
    return jsonify(possible_parameter)
    

# Route basierend auf POST-Anfragen
# Bei Eingabe im Suchfeld werden Einträge aus der Datenbank angezeigt, die eine Übereinstimmung mit dem User Input hat
@app.route('/get-suggestions', methods=['POST'])
def get_suggestions():
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Extraktion des Werts für Schlüssel 'input' aus JSON-Körper
    user_input = data.get('input', '')
    # Verbindung zur Datenbank
    engine = create_engine("sqlite:///O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db")

    # Auswahl aller eindeutigen Namen aus Tabelle namen unabhängig von Groß- und Kleinschreibung,
    # wenn der User Input im Parameternamen enthalten ist
    query = """
        SELECT DISTINCT name 
        FROM namen 
        WHERE LOWER(name) LIKE '%' || LOWER(:user_input) || '%';
    """
    
    # Ausführung der Abfrage und Rückgabe des Ergebnis in ein Dataframe
    suggestions = pd.read_sql(query, engine, params={'user_input': user_input})['name'].tolist()
    # Rückgabe der JSON-Antwort, die die gefundenen Vorschläge enthält
    return jsonify({'suggestions': suggestions})


# Route basierend auf POST-Anfragen
# Bei Ausführung werden die Abreicherungsmethoden in der Datenbank aktualisiert
@app.route('/save_edited_method', methods=['POST'])
def save_edited_method():
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Extraktion des Werts für Schlüssel 'textTitle' aus JSON-Körper
    text_title = data.get('textTitle', '')
    # Extraktion des Werts für Schlüssel 'textDescription' aus JSON-Körper
    text_description = data.get('textDescription', '')
    # Extraktion des Werts für Schlüssel 'input' aus JSON-Körper
    user_input = data['input']
    # Extraktion Methodenname vor der Aktualisierung
    old_title = data['oldMethodTitle']
    # Verbindung zur Datenbank
    conn = sqlite3.connect('O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db')
    cursor = conn.cursor()
    # Aktualisierung der Datenbank
    query = """ UPDATE abreicherung
                SET methodenname = ?,
                    methode = ?
                WHERE name = ?
                AND methodenname = ?;"""
    values = (text_title, text_description, user_input, old_title)
    cursor.execute(query, values)
    conn.commit()


# Route basierend auf POST-Anfragen
# Bei Ausführung wird neue Abreicherungsmethode in die Datenbank gespeichert
@app.route('/save_new_method', methods=['POST'])
def save_new_method():
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Extraktion des Werts für Schlüssel 'textTitle' aus JSON-Körper
    text_title = data.get('textTitle', '')
    # Extraktion des Werts für Schlüssel 'textDescription' aus JSON-Körper
    text_description = data.get('textDescription', '')
    # Extraktion des Werts für Schlüssel 'input' aus JSON-Körper
    user_input = data['input']
    # Aktualisierung der Datenbank
    conn = sqlite3.connect('O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db')
    cursor = conn.cursor()
    query = "INSERT INTO abreicherung (name, methodenname, methode) VALUES (?, ?, ?)"
    values = (user_input, text_title, text_description)
    cursor.execute(query, values)
    conn.commit()
    
    
# Route basierend auf POST-Anfragen
# Bei Ausführung wird ausgewählte Abreicherungsmethode aus der Datenbank gelöscht
@app.route('/delete_method', methods=['POST'])
def delete_method():
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Extraktion des Werts für Schlüssel 'textTitle' aus JSON-Körper
    text_title = data.get('textTitle', '')
    # Extraktion des Werts für Schlüssel 'input' aus JSON-Körper
    user_input = data['input']
    # Aktualisierung der Datenbank
    conn = sqlite3.connect('O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db')
    cursor = conn.cursor()
    query = """ DELETE FROM abreicherung
                WHERE name = ?
                AND methodenname = ?"""
    values = (user_input, text_title)
    cursor.execute(query, values)
    conn.commit()
    
    
# Route basierend auf POST-Anfragen
# Bei Ausführung werden die bearbeiteten Einträge gespeichert
@app.route('/save_in_database', methods=['POST'])
def save_in_database():
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Extraktion des Werts für Schlüssel 'tableName' aus JSON-Körper
    table = data.get('tableName', '') # entspricht dem Kategorienamen (z. Bsp. Allgemein, Biochemie etc.)
    # Extraktion des Werts für Schlüssel 'newEntries' aus JSON-Körper
    neue_einträge = data.get('newEntries', '') # entspricht den Inputs in den Eingabefeldern: dabei handelt es sich um eine Liste mit allen Einträgen in der Kategorie
    # Extraktion des Werts für Schlüssel 'input' aus JSON-Körper
    user_input= data['input']
    # Extraktion des Werts für Schlüssel 'namen' aus JSON-Körper
    para_namen = data['namen']
    # Extraktion des Werts für Schlüssel 'abk' aus JSON-Körper
    abk = data['abk']
    
    # Dictionary zum Zuordnen der Tabellennamen zu den entsprechenden IDs in der HTML-Datei
    table_dict = {
        'allgemein-section': 'namen',
        'biochemie-section': 'biochemie',
        'funktion-section': 'funktionen',
        'diagnostik-section': 'diagnostik',
        'abreicherung-section': 'abreicherung'
    }
    
    # Identifizieren des Tabellennamens
    table_database = table_dict[table]
    # Aktualisierung der Datenbank
    conn = sqlite3.connect('O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db')
    cursor = conn.cursor()
    
    # Aktualisierung der Tabelle 'namen'
    if table_database == 'namen':
        query = """ UPDATE namen
                    SET name = ?,
                        weitere_namen = ?,
                        abkürzungen = ?
                    WHERE name = ?;"""
        values = (neue_einträge[0], neue_einträge[1], neue_einträge[2], user_input)
        cursor.execute(query, values)
        
        # falls der Name des Parameters geändert wurde, muss dieser in allen Tabellen der Datenbank geändert werden
        if neue_einträge[0] != user_input:
            # Iteration über alle Tabellen der Datenbank
            # außer 'analytik' (da diese Daten nicht vom User geändert werden, sondern aus Messsystemstabelle automatisch entnommen werden)
            for tab in list(table_dict.values()):
                query = f"""UPDATE {tab}
                            SET name = ?
                            WHERE name = ?;"""
                values = (neue_einträge[0], user_input)
                cursor.execute(query, values)
                conn.commit()
            # Parametername in analytik-Tabelle updaten
            query = """ UPDATE analytik
                        SET name = ?
                        WHERE name = ?;"""
            values = (neue_einträge[0], user_input)
            cursor.execute(query, values)
            
        # Update der Analytik-Tabelle, da durch Änderungen des Parameternamens die Analytik-Tabelle ergänzt werden könnte
        # Suche nach Excel-Dateien im Ordner
        files = glob.glob('O:/Datenmanagement/Befunde und Messsysteme/Messsysteme/1_Auftragslabore/*.xlsx*')
        # Iteration über die Dateien, um die richtige Datei mit dem gegebenen Namen zu identifizieren
        for i in range(len(files)):
            if 'Messsysteme und Preise aller Auftragslabore' in files[i]:
                path = files[i]
                break

        # im Fall, dass die Excel-Tabelle von einem anderen User geöffnet ist,
        # wird eine temporäre Datei erstellt
        try:
            xls = pd.ExcelFile(path) # Öffnen von Excel-Datei an dem gegebenen Pfad
            sheet_names = xls.sheet_names # Liste der Tabellenblätter erhalten
            sheet_names.remove('Tabelle1') # Übeflüssiges Blatt aus Liste entfernen
            # Alle übrigen Tabellenblätter einlesen
            # Für jedes verbleibende Tabellenblatt in sheet_names wird ein DataFrame df erstellt,
            # der die Daten des Tabellenblatts enthält.
            # Diese DataFrames werden in der Liste tables gesammelt.
            tables = []
            for sheet in sheet_names:
                df = pd.read_excel(path, sheet_name = sheet)
                tables.append(df)
        except: # falls ein Fehler auftritt (weil die Tabelle gerade geöffnet ist)
            if '~$' in path:
                path = path.replace('~$', '') # Entfernen des Präfixes (bei geöffneten Dateien der Fall)
            # Temporäres Verzeichnis und Datei erstellen
            emp_dir = tempfile.mkdtemp()        
            temp_file_path = tempfile.mktemp(suffix='.xlsx', dir=temp_dir)
            # Originaldatei in die temporäre Datei kopieren
            shutil.copy2(path, temp_file_path)
            try:
                # Erneuter Versuch, Datei zu lesen (dieses Mal die temporäre Kopie)
                xls = pd.ExcelFile(path)
                sheet_names = xls.sheet_names
                sheet_names.remove('Tabelle1')
                tables = []
                for sheet in sheet_names:
                    df = pd.read_excel(path, sheet_name = sheet)
                    tables.append(df)
            finally:
                # Temporäres Verzeichnis und Datei löschen
                shutil.rmtree(temp_dir)

        # Tabellen einheitlich nach Spalten ordnen
        # bis auf LADR sind alle Tabellen gleich strukturiert
        # Iteration über die Tabellenblätter
        for i in range(len(tables)):
            if i != 6: # der 5. Eintrag in der Liste tables gehört zu LADR (dieser wird übersprungen)
                tables[i].columns = tables[i].iloc[1].tolist() # Spaltennamen aus der 2. Zeile entnehmen
                # Auswahl der wichtigen Spalten
                try:
                    tables[i] = tables[i][['Parameter', 'Angebots- Preis (excl. MwSt)', 
                                           'Methode', 'Gerät', 'Hersteller/ Gerät',
                                           'jüngste Bestä-tigung/ Stand/ Aktualisierungs-datum']]
                except:
                    # wegen Formatierungsproblemen beim Import von Excel
                    tables[i] = tables[i][['Parameter', 'Angebots- Preis (excl. MwSt)', 
                                           'Methode', 'Gerät', 'Hersteller/ Gerät',
                                           'jüngste Bestätigung der Gültigkeit/ Aktualisierungs-datum']]
                # Umbenennung der Spalten
                tables[i].columns = ['Parameter', 'Preis', 'Methode', 'Messsystem', 'Hersteller', 'Datum']
                # Entfernen der leeren/überflüssigen Zeilen
                tables[i] = tables[i].iloc[2:]
            else: # anderer Vorgang für LADR-Tabelle
                tables[i].columns = tables[i].iloc[2].tolist() # Spaltennamen befinden sich in der 3. Zeile
                # Auswahl der wichtigen Spalten
                try:
                    tables[i] = tables[i][['laboratory parameter', 'Angebots- Preis (excl. MwSt)',
                                           'measuring method', 'measuring System',
                                           'manufacturer of measuring system',
                                           'jüngste Bestä-tigung/ Stand/ Aktualisierungs-datum']]
                except:
                    tables[i] = tables[i][['laboratory parameter', 'Angebots- Preis (excl. MwSt)',
                                           'measuring method', 'measuring System',
                                           'manufacturer of measuring system',
                                           'jüngste Bestätigung der Gültigkeit/ Aktualisierungs-datum']]
                # Umbenennung der Spalten
                tables[i].columns = ['Parameter', 'Preis', 'Methode', 'Messsystem', 'Hersteller', 'Datum']
                # Entfernen der leeren/überflüssigen Zeilen
                tables[i] = tables[i].iloc[3:]
                
        # Datumsformat anpasssen
        for i in range(len(tables)):
            tables[i]['Datum'] = tables[i]['Datum'].apply(convert_date)

        # Suche nach Parameter in der Tabelle
        para_found = False # flag für gesuchten Parameter unter existierenden Parameternamen in der Datenbank
        # (false bedeutet nicht gefunden, true bedeutet gefunden)
        para_found_more = False # gleicher flag für existierenden Parameter-Schreibweisen
        labor = [] # Initialisierung Liste der Labore, die den gesuchten Parameter vermessen
        parameter_richtig = user_input # Umbenennung Variable
        # Iteration über die Tabellenblätter
        for i in range(len(tables)):
            # Iteration über die Zeilen in der Tabelle
            for j in range(len(tables[i])):
                # Bei Findung des Parameters in einer der Zeilen der Tabelle,
                # wird die Liste mit den Laboren ergänzt
                if parameter_richtig in str(tables[i].iloc[j,0]):
                    labor.append(sheet_names[i]) # Hinzufügen des Labors in die Liste der Labore
                    para_found = True # Setzen des flags für gefundenen Parameter auf true
                    break # exit loop zum Verkürzen der Wartezeit
                    # (es ist nicht nötig, dass über alle Zeilen iteriert wird, wenn der Parameter bereits in den Zeilen gefunden wurde)

        if para_namen != '':
            # falls der Eintrag in den alternativen Schreibweisen nicht leer ist,
            # wird versucht, die alternativen Parameternamen in den Tabellen zu finden
            para_more = para_namen.split(',') # nach Komma splitten
            para_more = [para.strip() for para in para_more] # alternative Parameterbezeichnungen in eine Liste übergeben
            # Iteration über die Tabellenblätter
            for i in range(len(tables)):
                # Iteration über die Zeilen der Tabelle
                for j in range(len(tables[i])):
                    break_loop = False # Initialisierung des flags: bei true wird aus dem Loop gebrochen
                    # Iteration über Liste mit alternativen Parameterbezeichnungen
                    for para in para_more:
                        if para in str(tables[i].iloc[j,0]): # bei Finden von einer der alternativen Parameterbezeichnunhen in einer der Zeilen der Tabelle
                            if sheet_names[i] not in labor:
                                labor.append(sheet_names[i]) # Ergänzen der Liste mit Labor, der den Parameter vermisst
                                para_found_more = True # flag, dass Parameter gefunden wurde
                                parameter = para # Benennung der Variablen Parameter
                                break_loop = True # flag, dass vorzeitig aus dem eins übergeordneten Loop ausgebrochen werden kann, da der Parameter gefunden wurde
                                break # Break aus Loop
                    if break_loop:
                        break # Break aus Loop
            # Abkürzungen absuchen
            if abk != '':
                para_abk = abk.split(',') # nach Komma splitten
                para_abk = [para.strip() for para in para_abk]
                # Iteration über die Tabellenblätter
                for i in range(len(tables)):
                    # Iteration über die Zeilen der Tabelle
                    for j in range(len(tables[i])):
                        break_loop_more = False # Initialisierung des flags: bei true wird aus dem Loop gebrochen
                        # Iteration über die Liste mit den Parameterabkürzungen
                        for para in para_abk:
                            if para in str(tables[i].iloc[j,0]): # bei Finden von einer der Abkürzungen in einer der Zeilen der Tabelle 
                                if sheet_names[i] not in labor:
                                    labor.append(sheet_names[i]) # Ergänzen der Liste mit Labor, der den Parameter vermisst
                                    parameter = para # Benennung der Variablen Parameter
                                    break_loop_more = True # flag, dass vorzeitig aus dem eins übergeordneten Loop ausgebrochen werden kann, da der Parameter gefunden wurde
                                    break # Break aus Loop
                        if break_loop_more:
                            break # Break aus Loop
                                
        # Analytik-Tabelle leeren
        query = '''DELETE FROM analytik
                    WHERE name = ?;'''
        cursor.execute(query, (parameter_richtig,))

        # Ablesen der Messsysteme, Tests etc.
        # Iteration über die Labore
        for lab in labor:
            # entsprechende Tabelle für das Labor mit Verwendung des Index extrahieren
            table = tables[sheet_names.index(lab)]
            # Initialisierung der Variable, die die Zeilennummer speichert, in denen der Parameter gefunden wurde
            parameter_rows = []
            # flag: boolescher Wert, der anzeigt, ob der Parameter in der Tabelle gefunden wurde
            para_flag = False
            # Iteration über die Zeilen der Tabelle
            for i in range(len(table)):
                # Splitten des Eintrags in der Tabelle Zeile i nach Sonderzeichen,
                # da die Datenstruktur der uneinheitlich ist und in den Daten viele dieser Sonderzeichen vorzufinden sind
                # hiermit kann ein präziseres Identifizieren des Parameternamens in den unstrukturierten Daten gewährleister werden können
                if (parameter in table.iloc[i,0].split('-')) | (parameter in table.iloc[i,0].split('/')):
                    # falls der Parameter in den Einträgen enthalten ist, wird der Index der Zeile in die Liste parameter_rows hinzugefügt
                    parameter_rows.append(i)
                    para_flag = True # flag wird auf true gesetzt
                # Suche erfolgt auch für Alternativnamen und Abkürzungen
                for para in para_more:
                    if para in table.iloc[i,0]:
                        if i not in parameter_rows:
                            parameter_rows.append(i)
                for para in para_abk:
                    if para in table.iloc[i,0]:
                        if i not in parameter_rows:
                            parameter_rows.append(i)
            if not para_flag: # falls nach der Iteration der Parameter nicht gefunden wurde
                for i in range(len(table)): # erneute Iteration über die Zeilen der Tabelle
                    if parameter in table.iloc[i,0]:
                        # Finden des Parameters in Zeile ohne vorherige Auftrennung der Daten
                        # hier kann überlegt werden, ob nicht ohne Auftrennung der Daten gearbeitet wird (wäre schneller und unkomplizierter, allerdings falsches Identifizieren der Zeilen möglich)
                        parameter_rows.append(i) # Ergänzung der Liste mit Index der Zeile, wo der Parameter gefunden wurde          
            table_parameter = table.iloc[parameter_rows,:] # extrahiert alle Zeilen mit den Indizes in parameter_rows aus table
            # Setzt den Index der DataFrame table_parameter zurück, sodass die Zeilen fortlaufend nummeriert sind
            table_parameter = table_parameter.reset_index().drop('index', axis=1)

            # Eintrag in die Datenbank
            for i in range(len(table_parameter)): # Iteration über Zeilen des Dataframes
                lab_name = table_parameter.iloc[i,0] # Extrahieren des Labornamens
                meth = table_parameter.iloc[i,2] # Methode
                messsys = table_parameter.iloc[i,3] # Messsystem
                herst = table_parameter.iloc[i,4] # Hersteller
                datum = table_parameter.iloc[i,5] # Datum

                # try-except-Block wird verwendet, um den Wert der zweiten Spalte zu runden, falls es sich um eine Zahl handelt
                try:
                    pr = round(table_parameter.iloc[i,1], 2) # Runden auf 2 Dezimalstellen
                except:
                    # Wenn der Wert nicht numerisch ist und daher nicht gerundet werden kann, fängt der except-Block den Fehler ab
                    pr = table_parameter.iloc[i,1] # Übernehmen des Eintrags ohne zu runden

                # Einfügen in die Datenbank
                query = '''INSERT INTO analytik (name, name_labor, labor, methode, messsystem, hersteller, preis, datum)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?);'''
                cursor.execute(query, (parameter_richtig, lab_name, lab, meth, messsys, herst, pr, datum))
        conn.commit()
            
    # Aktualisierung der Tabelle 'biochemie'
    elif table_database == 'biochemie':
        query = """ UPDATE biochemie
                    SET molekulare_masse = ?,
                        aminosäuren = ?,
                        oligomerisierung = ?,
                        glykolisierung = ?,
                        bindungsmotiv = ?,
                        enzymfunktion = ?
                    WHERE name = ?;"""
        values = (neue_einträge[0], neue_einträge[1], neue_einträge[2], neue_einträge[3],
                  neue_einträge[4], neue_einträge[5], user_input)
        cursor.execute(query, values)
        
    # Aktualisierung der Tabelle 'funktionen'
    elif table_database == 'funktionen':
        query = """ UPDATE funktionen
                    SET synthetisierendes_gewebe = ?,
                        elektrophorese = ?,
                        immunsystem = ?,
                        hauptfunktion = ?,
                    WHERE name = ?;"""
        values = (neue_einträge[0], neue_einträge[1], neue_einträge[2], neue_einträge[3], user_input)
        cursor.execute(query, values)
        
    # Aktualisierung der Tabelle 'diagnostik'
    elif table_database == 'diagnostik':
        query = """ UPDATE diagnostik
                    SET biomaterial = ?,
                        referenzbereich = ?,
                        erhöhte_werte = ?,
                        erniedrigte_werte = ?,
                    WHERE name = ?;"""
        values = (neue_einträge[0], neue_einträge[1], neue_einträge[2], neue_einträge[3], user_input)
        cursor.execute(query, values)
        
    # Aktualisierung der Tabelle 'abreicherung'
    elif table_database == 'abreicherung':
        query = """ UPDATE abreicherung
                    SET labor = ?,
                        methodenname = ?,
                        methode = ?,
                    WHERE name = ?;"""
        values = (neue_einträge[0], neue_einträge[1], user_input)
        cursor.execute(query, values)
    conn.commit()
        
        
# Route basierend auf POST-Anfragen
# Bei Ausführung wird ein neuer Eintrag in die Datenbank gespeichert
@app.route('/save_new_entry', methods=['POST'])
def save_new_entry():
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Alle Inputs in den Eingabefeldern werden in Variablen gespeichert
    parameter = data.get('paraName', '')
    para_namen = data.get('paraNamen', '')
    abk = data.get('paraAbk', '')
    molmasse = data.get('molMasse', '')
    aminos = data.get('aminoAcids', '')
    oligo = data.get('oligomerisierung', '')
    glyko = data.get('glykolisierung', '')
    bind = data.get('bindMotiv', '')
    enzym = data.get('enzymFunktion', '')
    synth = data.get('synthGewebe', '')
    elek = data.get('elektrophorese', '')
    immun = data.get('immunsystem', '')
    haupt = data.get('hauptfunktion', '')
    biomat = data.get('biomaterial', '')
    ref = data.get('referenz', '')
    hoch = data.get('hoheWerte', '')
    niedrig = data.get('niedrigeWerte', '')
    meth_name = data.get('methodenName', '')
    metho = data.get('methode', '')

    # Verbindung zur Datenbank
    conn = sqlite3.connect('O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db')
    cursor = conn.cursor()
    
    # Ergänzung der Tabelle 'namen'
    query = """ INSERT INTO namen
                (name,
                weitere_namen,
                abkürzungen) 
                VALUES (?, ?, ?);"""
    values = (parameter, para_namen, abk)
    cursor.execute(query, values)
    
    # Ergänzung der Tabelle 'biochemie'
    query = """ INSERT INTO biochemie
                (name,
                molekulare_masse,
                aminosäuren,
                oligomerisierung,
                glykolisierung,
                bindungsmotiv,
                enzymfunktion)
                VALUES (?, ?, ?, ?, ?, ?, ?);"""
    values = (parameter, molmasse, aminos, oligo, glyko, bind, enzym)
    cursor.execute(query, values)
    
    # Ergänzung der Tabelle 'funktionen'
    query = """ INSERT INTO funktionen
                (name,
                synthetisierendes_gewebe,
                elektrophorese,
                immunsystem,
                hauptfunktion)
                VALUES (?, ?, ?, ?, ?);"""
    values = (parameter, synth, elek, immun, haupt)
    cursor.execute(query, values)
    
    # Ergänzung der Tabelle 'diagnostik'
    query = """ INSERT INTO diagnostik
                (name,
                biomaterial,
                referenzbereich,
                erhöhte_werte,
                erniedrigte_werte)
                VALUES (?, ?, ?, ?, ?);"""
    values = (parameter, biomat, ref, hoch, niedrig)
    cursor.execute(query, values)
    
    # Ergänzung der Tabelle 'abreicherung'
    query = """ INSERT INTO abreicherung
                (name,
                methodenname,
                methode)
                VALUES (?, ?, ?)"""
    values = (parameter, meth_name, metho)
    cursor.execute(query, values)
        
    # Ergänzung der Tabelle 'analytik'
    # Suche nach Excel-Dateien im Ordner
    files = glob.glob('O:/Datenmanagement/Befunde und Messsysteme/Messsysteme/1_Auftragslabore/*.xlsx*')
    # Iteration über die Dateien, um die richtige Datei mit dem gegebenen Namen zu identifizieren
    for i in range(len(files)):
        if 'Messsysteme und Preise aller Auftragslabore' in files[i]:
            path = files[i]
            break

    # im Fall, dass die Excel-Tabelle von einem anderen User geöffnet ist,
    # wird eine temporäre Datei erstellt
    try:
        xls = pd.ExcelFile(path) # Öffnen von Excel-Datei an dem gegebenen Pfad
        sheet_names = xls.sheet_names # Liste der Tabellenblätter erhalten
        sheet_names.remove('Tabelle1') # Übeflüssiges Blatt aus Liste entfernen
        # Alle übrigen Tabellenblätter einlesen
        # Für jedes verbleibende Tabellenblatt in sheet_names wird ein DataFrame df erstellt,
        # der die Daten des Tabellenblatts enthält.
        # Diese DataFrames werden in der Liste tables gesammelt.
        tables = []
        for sheet in sheet_names:
            df = pd.read_excel(path, sheet_name = sheet)
            tables.append(df)
    except: # falls ein Fehler auftritt (weil die Tabelle gerade geöffnet ist)
        if '~$' in path:
            path = path.replace('~$', '') # Entfernen des Präfixes (bei geöffneten Dateien der Fall)
        # Temporäres Verzeichnis und Datei erstellen
        emp_dir = tempfile.mkdtemp()        
        temp_file_path = tempfile.mktemp(suffix='.xlsx', dir=temp_dir)
        # Originaldatei in die temporäre Datei kopieren
        shutil.copy2(path, temp_file_path)
        try:
            # Erneuter Versuch, Datei zu lesen (dieses Mal die temporäre Kopie)
            xls = pd.ExcelFile(path)
            sheet_names = xls.sheet_names
            sheet_names.remove('Tabelle1')
            tables = []
            for sheet in sheet_names:
                df = pd.read_excel(path, sheet_name = sheet)
                tables.append(df)
        finally:
            # Temporäres Verzeichnis und Datei löschen
            shutil.rmtree(temp_dir)

    # Tabellen einheitlich nach Spalten ordnen
    # bis auf LADR sind alle Tabellen gleich strukturiert
    # Iteration über die Tabellenblätter
    for i in range(len(tables)):
        if i != 6: # der 5. Eintrag in der Liste tables gehört zu LADR (dieser wird übersprungen)
            tables[i].columns = tables[i].iloc[1].tolist() # Spaltennamen aus der 2. Zeile entnehmen
            # Auswahl der wichtigen Spalten
            try:
                tables[i] = tables[i][['Parameter', 'Angebots- Preis (excl. MwSt)', 
                                       'Methode', 'Gerät', 'Hersteller/ Gerät',
                                       'jüngste Bestä-tigung/ Stand/ Aktualisierungs-datum']]
            except:
                # wegen Formatierungsproblemen beim Import von Excel
                tables[i] = tables[i][['Parameter', 'Angebots- Preis (excl. MwSt)', 
                                       'Methode', 'Gerät', 'Hersteller/ Gerät',
                                       'jüngste Bestätigung der Gültigkeit/ Aktualisierungs-datum']]
            # Umbenennung der Spalten
            tables[i].columns = ['Parameter', 'Preis', 'Methode', 'Messsystem', 'Hersteller', 'Datum']
            # Entfernen der leeren/überflüssigen Zeilen
            tables[i] = tables[i].iloc[2:]
        else: # anderer Vorgang für LADR-Tabelle
            tables[i].columns = tables[i].iloc[2].tolist() # Spaltennamen befinden sich in der 3. Zeile
            # Auswahl der wichtigen Spalten
            try:
                tables[i] = tables[i][['laboratory parameter', 'Angebots- Preis (excl. MwSt)',
                                       'measuring method', 'measuring System',
                                       'manufacturer of measuring system',
                                       'jüngste Bestä-tigung/ Stand/ Aktualisierungs-datum']]
            except:
                tables[i] = tables[i][['laboratory parameter', 'Angebots- Preis (excl. MwSt)',
                                       'measuring method', 'measuring System',
                                       'manufacturer of measuring system',
                                       'jüngste Bestätigung der Gültigkeit/ Aktualisierungs-datum']]
            # Umbenennung der Spalten
            tables[i].columns = ['Parameter', 'Preis', 'Methode', 'Messsystem', 'Hersteller', 'Datum']
            # Entfernen der leeren/überflüssigen Zeilen
            tables[i] = tables[i].iloc[3:]
            
    # Datumsformat anpasssen
    for i in range(len(tables)):
        tables[i]['Datum'] = tables[i]['Datum'].apply(convert_date)
        

    # Suche nach Parameter in der Tabelle
    para_found = False # flag für gesuchten Parameter unter existierenden Parameternamen in der Datenbank
    # (false bedeutet nicht gefunden, true bedeutet gefunden)
    para_found_more = False # gleicher flag für existierenden Parameter-Schreibweisen
    labor = [] # Initialisierung Liste der Labore, die den gesuchten Parameter vermessen
    parameter_richtig = parameter # Umbenennung Variable
    # Iteration über die Tabellenblätter
    for i in range(len(tables)):
        # Iteration über die Zeilen in der Tabelle
        for j in range(len(tables[i])):
            # Bei Findung des Parameters in einer der Zeilen der Tabelle,
            # wird die Liste mit den Laboren ergänzt
            if parameter_richtig in str(tables[i].iloc[j,0]):
                labor.append(sheet_names[i]) # Hinzufügen des Labors in die Liste der Labore
                para_found = True # Setzen des flags für gefundenen Parameter auf true
                break # exit loop zum Verkürzen der Wartezeit
                # (es ist nicht nötig, dass über alle Zeilen iteriert wird, wenn der Parameter bereits in den Zeilen gefunden wurde)
    
    if para_namen != '':
        # falls der Eintrag in den alternativen Schreibweisen nicht leer ist,
        # wird versucht, die alternativen Parameternamen in den Tabellen zu finden
        para_more = para_namen.split(',') # nach Komma splitten
        para_more = [para.strip() for para in para_more] # alternative Parameterbezeichnungen in eine Liste übergeben
        # Iteration über die Tabellenblätter
        for i in range(len(tables)):
            # Iteration über die Zeilen der Tabelle
            for j in range(len(tables[i])):
                break_loop = False # Initialisierung des flags: bei true wird aus dem Loop gebrochen
                # Iteration über Liste mit alternativen Parameterbezeichnungen
                for para in para_more:
                    if para in str(tables[i].iloc[j,0]): # bei Finden von einer der alternativen Parameterbezeichnunhen in einer der Zeilen der Tabelle
                        if sheet_names[i] not in labor:
                            labor.append(sheet_names[i]) # Ergänzen der Liste mit Labor, der den Parameter vermisst
                            para_found_more = True # flag, dass Parameter gefunden wurde
                            parameter = para # Benennung der Variablen Parameter
                            break_loop = True # flag, dass vorzeitig aus dem eins übergeordneten Loop ausgebrochen werden kann, da der Parameter gefunden wurde
                            break # Break aus Loop
                if break_loop:
                    break # Break aus Loop
        # Abkürzungen suchen
        if abk != '':
            para_abk = abk.split(',') # nach Komma splitten
            para_abk = [para.strip() for para in para_abk]
            # Iteration über die Tabellenblätter
            for i in range(len(tables)):
                # Iteration über die Zeilen der Tabelle
                for j in range(len(tables[i])):
                    break_loop_more = False # Initialisierung des flags: bei true wird aus dem Loop gebrochen
                    # Iteration über die Liste mit den Parameterabkürzungen
                    for para in para_abk:
                        if para in str(tables[i].iloc[j,0]): # bei Finden von einer der Abkürzungen in einer der Zeilen der Tabelle 
                            if sheet_names[i] not in labor:
                                labor.append(sheet_names[i]) # Ergänzen der Liste mit Labor, der den Parameter vermisst
                                parameter = para # Benennung der Variablen Parameter
                                break_loop_more = True # flag, dass vorzeitig aus dem eins übergeordneten Loop ausgebrochen werden kann, da der Parameter gefunden wurde
                                break # Break aus Loop
                    if break_loop_more:
                        break # Break aus Loop
                        
    # Ablesen der Messsysteme, Tests etc.
    # Iteration über die Labore
    for lab in labor:
        # entsprechende Tabelle für das Labor mit Verwendung des Index extrahieren
        table = tables[sheet_names.index(lab)]
        # Initialisierung der Variable, die die Zeilennummer speichert, in denen der Parameter gefunden wurde
        parameter_rows = []
        # flag: boolescher Wert, der anzeigt, ob der Parameter in der Tabelle gefunden wurde
        para_flag = False
        # Iteration über die Zeilen der Tabelle
        for i in range(len(table)):
            # Splitten des Eintrags in der Tabelle Zeile i nach Sonderzeichen,
            # da die Datenstruktur der uneinheitlich ist und in den Daten viele dieser Sonderzeichen vorzufinden sind
            # hiermit kann ein präziseres Identifizieren des Parameternamens in den unstrukturierten Daten gewährleister werden können
            if (parameter in table.iloc[i,0].split('-')) | (parameter in table.iloc[i,0].split('/')):
                # falls der Parameter in den Einträgen enthalten ist, wird der Index der Zeile in die Liste parameter_rows hinzugefügt
                parameter_rows.append(i)
                para_flag = True # flag wird auf true gesetzt
            # Suche erfolgt auch für Alternativnamen und Abkürzungen
            for para in para_more:
                if para in table.iloc[i,0]:
                    if i not in parameter_rows:
                        parameter_rows.append(i)
            for para in para_abk:
                if para in table.iloc[i,0]:
                    if i not in parameter_rows:
                        parameter_rows.append(i)
        if not para_flag: # falls nach der Iteration der Parameter nicht gefunden wurde
            for i in range(len(table)): # erneute Iteration über die Zeilen der Tabelle
                if parameter in table.iloc[i,0]:
                    # Finden des Parameters in Zeile ohne vorherige Auftrennung der Daten
                    # hier kann überlegt werden, ob nicht ohne Auftrennung der Daten gearbeitet wird (wäre schneller und unkomplizierter, allerdings falsches Identifizieren der Zeilen möglich)
                    # d. h. Zeile 695 wird mit Zeile 701 ersetzt, Zeilen 699-705 (in Jupyter Notebook, woanders könnte es sein, dass die Zeilen sich verschieben) sowie der para_flag könnten entfernt werden
                    parameter_rows.append(i) # Ergänzung der Liste mit Index der Zeile, wo der Parameter gefunden wurde          
        table_parameter = table.iloc[parameter_rows,:] # extrahiert alle Zeilen mit den Indizes in parameter_rows aus table
        # Setzt den Index der DataFrame table_parameter zurück, sodass die Zeilen fortlaufend nummeriert sind
        table_parameter = table_parameter.reset_index().drop('index', axis=1)

        # Eintrag in die Datenbank
        for i in range(len(table_parameter)): # Iteration über Zeilen des Dataframes
            lab_name = table_parameter.iloc[i,0] # Extrahieren des Labornamens
            meth = table_parameter.iloc[i,2] # Methode
            messsys = table_parameter.iloc[i,3] # Messsystem
            herst = table_parameter.iloc[i,4] # Hersteller
            datum = table_parameter.iloc[i,5] # Datum
            
            # try-except-Block wird verwendet, um den Wert der zweiten Spalte zu runden, falls es sich um eine Zahl handelt
            try:
                pr = round(table_parameter.iloc[i,1], 2) # Runden auf 2 Dezimalstellen
            except:
                # Wenn der Wert nicht numerisch ist und daher nicht gerundet werden kann, fängt der except-Block den Fehler ab
                pr = table_parameter.iloc[i,1] # Übernehmen des Eintrags ohne zu runden
                
            # Einfügen in die Datenbank
            query = '''INSERT INTO analytik (name, name_labor, labor, methode, messsystem, hersteller, preis, datum)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?);'''
            cursor.execute(query, (parameter_richtig, lab_name, lab, meth, messsys, herst, pr, datum))
    conn.commit()

    
    
# Route basierend auf POST-Anfragen
# Bei Ausführung wird ein Eintrag gelöscht
@app.route('/delete_entry', methods=['POST'])
def delete_entry():
    # Verbindung zur Datenbank
    conn = sqlite3.connect('O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db')
    cursor = conn.cursor()
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Speichern der Benutzereingabe in Variable
    user_input = data['input']
    # Iteration über alle Tabellen in der Datenbank zum Löschen der Einträge
    for tabelle in ['namen', 'biochemie', 'funktionen',
                    'diagnostik', 'analytik', 'abreicherung']:
        query = f"DELETE FROM {tabelle} WHERE name = ?;"
        cursor.execute(query, (user_input,))
    conn.commit()


# Route basierend auf POST-Anfragen
# Es soll überprüft werden, ob der gegebene Parameter in der Datenbank existiert
# Dementsprechend wird ein Boolescher Wert zurückgegeben
@app.route('/entry_check', methods=['POST'])
def entry_check():
    # Verbindung zur Datenbank
    engine = create_engine("sqlite:///O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db")
    # Auswahl der Tabelle 'namen'
    query = f"SELECT * FROM namen;"
    # Erstellen des Dataframes aus der Tabelle 'namen'
    table_parameter = pd.read_sql(query, engine)
    # alle möglichen Parameternamen (mit Abkürzungen etc.) werden in eine Liste übergeben
    alle_parameter = list(table_parameter['name']) + list(table_parameter['weitere_namen']) + list(table_parameter['abkürzungen'])
    # Klein- und Großschreibung soll beim Vergleich nicht beachtet werden, daher werden alle Parameternamen in Kleinschreibung umgewandelt
    alle_parameter = [para.lower() for para in alle_parameter]
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Speichern des gesuchten Parameternamens in Kleinschreibung in eine Variable
    parameter = data.get('paraName', '').lower()
    # Überprüfung, ob der Parameter in der Liste mit allen möglichen Parameternamen vorhanden ist
    if parameter in alle_parameter:
        return jsonify({'exists': True})
    else:
        return jsonify({'exists': False})
    

# Route basierend auf POST-Anfragen
# weitere Überprüfung, ob der gesuchte Parameter in der Datenbank vorhanden ist,
# falls dieser mit einem Sonderzeichen beginnt
@app.route('/entry_double_check', methods=['POST'])
def entry_double_check():
    #Datenbankverbindung
    engine = create_engine("sqlite:///O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db")
    #SQL-Abfrage aus, um alle Namen aus der Tabelle namen
    query = f"SELECT name FROM namen;"
    table_parameter = pd.read_sql(query, engine)
    # Speichern der Parameternamen in eine Liste
    namen = list(table_parameter['name'])
    # Abrufen des JSON-Körpers der Anfrage
    data = request.get_json()
    # Konvertieren in Kleinbuchstaben
    parameter = data.get('paraNameAfter', '').lower()
    # Check, ob Parameter bereits existiert
    if parameter in namen:
        return jsonify({'exists': True})
    # Wenn der Parameter nicht existiert, wird überprüft, ob er mit einer Ziffer oder einem Sonderzeichen beginnt
    else:
        if parameter[0].isdigit() or not parameter[0].isalnum():
            return jsonify({'sonderzeichen': True})
        else:
            return jsonify({'sonderzeichen': False})
        

    
    
############ Interaktionen auf Seite mit alphabetischer Anordnung ###############

# Route, die POST-Anfragen akzeptiert
@app.route('/get_alpha_suggestions', methods=['POST'])
def get_alpha_suggestions():
    # JSON-Daten aus der POST-Anfrage lesen
    data = request.get_json()
    # Extrahieren des Wertes für den Schlüssel 'letter'
    letter = data.get('letter', '') # wenn 'letter' nicht vorhanden ist -> Verwendung eines leeren Strings ''
    # Verbindung zur Datenbank
    engine = create_engine("sqlite:///O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db")
    # Abfrage, um eindeutige Parameternamen aus der Tabelle 'namen' abzurufen, die mit dem gegebenen Buchstaben 'letter' anfangen
    query = f"""SELECT DISTINCT name FROM namen
                WHERE name LIKE '{letter}%';"""
    # Übergabe des Ergebnis in eine Liste
    suggestions = pd.read_sql(query, engine)['name'].tolist()
    # Vorschläge werden als JSON-Antwort zurückgegeben
    return jsonify({'suggestions': suggestions})



##################################################

# Ausführen der Flask-App mit spezifischen Host- und Port-Einstellungen 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)


# In[ ]:




