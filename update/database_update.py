#!/usr/bin/env python
# coding: utf-8

# In[1]:


import sys
import pandas as pd
import sqlite3
import glob
from sqlalchemy import create_engine
from datetime import datetime


# In[7]:


# Verbindung zur Datenbank
conn = sqlite3.connect(r"O:\Forschung & Entwicklung\Entwicklung\Software-Entwicklung\Dodo_Datenbank\datenbank.db")
cursor = conn.cursor()

def update_database():
    """ Aktualisiert Datenbank mit den Daten aus der Messystemstabelle """
    try:
        # Alle Excel-Dateien aus dem Verzeichnis lesen
        files = glob.glob('O:/Datenmanagement/Befunde und Messsysteme/Messsysteme/1_Auftragslabore/*.xlsx*')
        # Den Dateipfad der Datei 'Messsysteme und Preise aller Auftragslabore' finden
        for i in range(len(files)):
            if 'Messsysteme und Preise aller Auftragslabore' in files[i]:
                path = files[i]
                break
                
        # Excel-Datei laden
        xls = pd.ExcelFile(path)
        # Alle Blätter der Excel-Datei auflisten
        sheet_names = xls.sheet_names
        # Das Blatt 'Tabelle1' entfernen, da es nicht benötigt wird
        sheet_names.remove('Tabelle1')
        
        # Daten von jedem Blatt in eine Liste von DataFrames einlesen
        tables = []
        for sheet in sheet_names:
            df = pd.read_excel(path, sheet_name = sheet)
            tables.append(df)

        # Tabellen richtig ordnen und formatieren
        # bis auf LADR sind alle Tabellen gleich strukturiert

        for i in range(len(tables)):
            if i != 6:
                # Spaltennamen auf Basis der zweiten Zeile festlegen
                tables[i].columns = tables[i].iloc[1].tolist()
                # Nur die relevanten Spalten behalten und umbenennen
                try:
                    tables[i] = tables[i][['Parameter', 'Angebots- Preis (excl. MwSt)', 
                                           'Methode', 'Gerät', 'Hersteller/ Gerät',
                                           'jüngste Bestä-tigung/ Stand/ Aktualisierungs-datum']]
                except:
                    # wegen Formatierungsproblemen beim Import von Excel
                    tables[i] = tables[i][['Parameter', 'Angebots- Preis (excl. MwSt)', 
                                           'Methode', 'Gerät', 'Hersteller/ Gerät',
                                           'jüngste Bestätigung der Gültigkeit/ Aktualisierungs-datum']]                    
                tables[i].columns = ['Parameter', 'Preis', 'Methode', 'Messsystem', 'Hersteller', 'Datum']
                # Die ersten zwei Zeilen entfernen
                tables[i] = tables[i].iloc[2:]
            else:
                # Spezielle Behandlung für die 7. Tabelle (LADR)
                tables[i].columns = tables[i].iloc[2].tolist()
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
                tables[i].columns = ['Parameter', 'Preis', 'Methode', 'Messsystem', 'Hersteller', 'Datum']
                tables[i] = tables[i].iloc[3:]

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
    
        for i in range(len(tables)):
            tables[i]['Datum'] = tables[i]['Datum'].apply(convert_date)
        
        # Liste aller Parameter aus der Datenbank abrufen
        query = "SELECT * FROM namen"
        engine = create_engine("sqlite:///O:/Forschung & Entwicklung/Entwicklung/Software-Entwicklung/Dodo_Datenbank/datenbank.db")
        parameter_table = pd.read_sql(query, engine)
        parameter_liste = list(parameter_table['name'])
        parameter_more = list(parameter_table['weitere_namen'])
        parameter_abk = list(parameter_table['abkürzungen'])

        # Tabelle 'analytik' leeren
        query = "DELETE FROM analytik;"
        cursor.execute(query)

        # Parameter in den Tabellen suchen und zuordnen
        for p in range(len(parameter_liste)):
            para_found = False
            para_found_more = False
            labor = []
            parameter_richtig = parameter_liste[p]
            # Durch alle Tabellen iterieren, um den Parameter zu finden
            for i in range(len(tables)):
                for j in range(len(tables[i])):
                    # Wenn der Parameter in der Tabelle gefunden wird, wird das Labor (Blattname) gespeichert
                    if parameter_richtig in str(tables[i].iloc[j,0]):
                        labor.append(sheet_names[i])
                        para_found = True
                        parameter = parameter_liste[p]
                        break
            # alternative Namen durchsuchen
            if parameter_more[p] != '':
                para_more = str(parameter_more[p]).split(',')
                para_more = [para.strip() for para in para_more]
                for i in range(len(tables)):
                    for j in range(len(tables[i])):
                        break_loop = False
                        for para in para_more:
                            if para in str(tables[i].iloc[j,0]):
                                if sheet_names[i] not in labor:
                                    labor.append(sheet_names[i])
                                    para_found_more = True
                                    parameter = para
                                    break_loop = True
                                    break
                        if break_loop:
                            break
                # Wenn alternative Namen auch nicht gefunden wurden, Abkürzungen durchsuchen
                if parameter_abk[p] != '':
                    para_abk = str(parameter_abk[p]).split(',')
                    para_abk = [para.strip() for para in para_abk]                        
                    for i in range(len(tables)):
                        for j in range(len(tables[i])):
                            break_loop_more = False
                            for para in para_abk:
                                if para in str(tables[i].iloc[j,0]):
                                    if sheet_names[i] not in labor:
                                        labor.append(sheet_names[i])
                                        parameter = para
                                        break_loop_more = True # flag, dass vorzeitig aus dem eins übergeordneten Loop ausgebrochen werden kann, da der Parameter gefunden wurde
                                        break # Break aus Loop
                            if break_loop_more:
                                break # Break aus Loop

            # Ablesen der Messsysteme, Tests etc.
            for lab in labor:
                table = tables[sheet_names.index(lab)]
                parameter_rows = []
                para_flag = False
                # Zeilen finden, in denen der Parameter vorkommt
                for i in range(len(table)):
                    if (parameter in str(table.iloc[i,0]).split('-')) | (parameter in str(table.iloc[i,0]).split('/')):
                        parameter_rows.append(i)
                        para_flag = True
                        # Suche erfolgt auch für Alternativnamen und Abkürzungen
                    for para in para_more:
                        if para in table.iloc[i,0]:
                            if i not in parameter_rows:
                                parameter_rows.append(i)
                    for para in para_abk:
                        if para in table.iloc[i,0]:
                            if i not in parameter_rows:
                                parameter_rows.append(i)

                if not para_flag:
                    for i in range(len(table)):
                        if parameter in table.iloc[i,0]:
                            parameter_rows.append(i)
                # Nur die Zeilen mit dem gesuchten Parameter behalten
                table_parameter = table.iloc[parameter_rows,:]
                table_parameter = table_parameter.reset_index().drop('index', axis=1)
                
                # Daten in die 'analytik'-Tabelle der Datenbank einfügen
                for i in range(len(table_parameter)):
                    lab_name = table_parameter.iloc[i,0]
                    meth = table_parameter.iloc[i,2]
                    messsys = table_parameter.iloc[i,3]
                    herst = table_parameter.iloc[i,4]
                    datum = table_parameter.iloc[i,5]
                    try:
                        pr = round(table_parameter.iloc[i,1], 2)
                    except:
                        pr = table_parameter.iloc[i,2]
                    query = '''INSERT INTO analytik (name, name_labor, labor, methode, messsystem, hersteller, preis, datum)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?);'''
                    cursor.execute(query, (parameter_richtig, lab_name, lab, meth, messsys, herst, pr, datum))

        # Änderungen in der Datenbank speichern
        conn.commit()
        return True
    except Exception as e:
        # Bei Fehlern die Fehlermeldung ausgeben
        import traceback
        print(traceback.print_exc())
        return False
    
if __name__ == "__main__":
    # Die Funktion ausführen und den Rückgabewert als Exit-Code verwenden
    if update_database():
        sys.exit(0)
    else:
        sys.exit(1)


# In[ ]:




