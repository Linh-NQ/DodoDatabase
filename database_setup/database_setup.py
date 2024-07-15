#!/usr/bin/env python
# coding: utf-8

# In[ ]:


# Erstellen der Dodo-Datenbank


# In[1]:


import pandas as pd
import sqlite3
import glob
from sqlalchemy import create_engine
conn = sqlite3.connect('datenbank.db')
cursor = conn.cursor()


# In[2]:


# Tabellen in der Datenbank erstellen

# Tabelle mit den Namen des Parameters
query = ''' CREATE TABLE IF NOT EXISTS namen (
            name VARCHAR PRIMARY KEY,
            weitere_namen VARCHAR,
            abkürzungen VARCHAR);'''
cursor.execute(query)

# Tabelle mit der Biochemie
query = ''' CREATE TABLE IF NOT EXISTS biochemie (
            name VARCHAR PRIMARY KEY,
            molekulare_masse VARCHAR,
            aminosäuren VARCHAR,
            oligomerisierung VARCHAR,
            glykolisierung VARCHAR,
            bindungsmotiv VARCHAR,
            enzymfunktion VARCHAR);'''
cursor.execute(query)

# Tabelle mit der Funktion
query = ''' CREATE TABLE IF NOT EXISTS funktionen (
            name VARCHAR PRIMARY KEY,
            synthetisierendes_gewebe VARCHAR,
            elektrophorese VARCHAR,
            immunsystem VARCHAR,
            hauptfunktion VARCHAR);'''
cursor.execute(query)

# Tabelle mit Infos zur Diagnostik
query = ''' CREATE TABLE IF NOT EXISTS diagnostik (
            name VARCHAR PRIMARY KEY,
            biomaterial VARCHAR,
            referenzbereich VARCHAR,
            erhöhte_werte VARCHAR,
            erniedrigte_werte VARCHAR);'''
cursor.execute(query)

# Tabelle mit Infos zur Analytik (hier sind doppelte Einträge möglich)
query = ''' CREATE TABLE IF NOT EXISTS analytik (
            name VARCHAR,
            name_labor VARCHAR,
            labor VARCHAR,
            methode VARCHAR,
            messsystem VARCHAR,
            hersteller VARCHAR,
            preis VARCHAR);'''
cursor.execute(query)

# Tabelle mit Infos zur Abreicherung (hier sind ebenfalls mehrere Einträge möglich)
query = ''' CREATE TABLE IF NOT EXISTS abreicherung (
            name VARCHAR,
            methodenname VARCHAR,
            methode VARCHAR);'''
cursor.execute(query)

conn.commit()


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


# In[ ]:




