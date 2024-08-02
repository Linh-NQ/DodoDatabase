#!/usr/bin/env python
# coding: utf-8

# In[ ]:


# Vorlage zum Füllen der Dodo-Datenbank


# In[1]:


import pandas as pd
import sqlite3
import glob
from sqlalchemy import create_engine
import os


# In[2]:


# Verbindung mit Datenbank
database_path = os.path.abspath(os.path.join(os.getcwd(), '..', 'datenbank.db'))
conn = sqlite3.connect(database_path)
cursor = conn.cursor()

# Datenbank mit Einträgen der Messsystem-Tabelle füllen
files = glob.glob('O:/Datenmanagement/Befunde und Messsysteme/Messsysteme/1_Auftragslabore\*.xlsx*')
for i in range(len(files)):
    if 'Messsysteme und Preise aller Auftragslabore' in files[i]:
        path = files[i]
        break
xls = pd.ExcelFile(path)
# Alle Reiter in Liste wiedergeben
sheet_names = xls.sheet_names
sheet_names.remove('Tabelle1')
# Alle Tabellen von Laboren ablesen
tables = []
for sheet in sheet_names:
    df = pd.read_excel(path, sheet_name = sheet)
    tables.append(df)

# Tabellen richtig ordnen
# bis auf LADR sind alle Tabellen gleich strukturiert
for i in range(len(tables)):
    if i != 6:
        tables[i].columns = tables[i].iloc[1].tolist()
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
        tables[i] = tables[i].iloc[2:]
    else:
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
                                   'jüngste Bestätigung der Gültigkeit/ Aktualisierungs-datum']
        tables[i].columns = ['Parameter', 'Preis', 'Methode', 'Messsystem', 'Hersteller', 'Datum']
        tables[i] = tables[i].iloc[3:]


# In[3]:


# Eintrag für Fibrinogen generieren

# Tabelle namen
query = ''' INSERT INTO namen (name, weitere_namen, abkürzungen)
            VALUES ('Fibrinogen', 'Gerinnungsfaktor I', 'FI');'''
cursor.execute(query)

# Tabelle biochemie
query = ''' INSERT INTO biochemie (name, molekulare_masse, aminosäuren, oligomerisierung)
            VALUES ('Fibrinogen', '340 kDa', 'Heterohexamer', 'Glykoprotein');'''
cursor.execute(query)

# Tabelle funktionen
query = ''' INSERT INTO funktionen (name, synthetisierendes_gewebe, elektrophorese, immunsystem, hauptfunktion)
            VALUES ('Fibrinogen', 'Leber', 'Fibrinogen', 'acute phase', 'Gerinnungsfaktor');'''
cursor.execute(query)

# Tabelle diagnostik
query = ''' INSERT INTO diagnostik (name, biomaterial, referenzbereich, erhöhte_werte, erniedrigte_werte)
            VALUES ('Fibrinogen', 'Plasma', '200 - 400 mg/dL', 'akute Infektion', 'Hypofibrinogenämie, Dysfibrinogenämie, Afibrinogenämie');'''
cursor.execute(query)

# Tabelle abreicherung
query = '''INSERT INTO abreicherung (name, methodenname, methode)
            VALUES ('Fibrinogen', 'Test für Methode', 'hier kommt der Text hin blabla test test');'''
cursor.execute(query)

query = '''INSERT INTO abreicherung (name, methodenname, methode)
            VALUES ('Fibrinogen', 'Test für Methode 2', 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.');'''
cursor.execute(query)

conn.commit()


# In[3]:


conn = sqlite3.connect('datenbank.db')
cursor = conn.cursor()
query = '''SELECT name FROM namen;'''
cursor.execute(query)


# In[ ]:




