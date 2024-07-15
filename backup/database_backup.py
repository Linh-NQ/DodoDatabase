#!/usr/bin/env python
# coding: utf-8

# In[2]:


import shutil

def backup_database():
    backup_filename = f"backup_dodo_datenbank.db"
    path = r"O:\Forschung & Entwicklung\Entwicklung\Software-Entwicklung\Dodo_Datenbank\datenbank.db"
    backup_destination = r"O:\Forschung & Entwicklung\Entwicklung\Software-Entwicklung\Dodo_Datenbank\backup"  # Specify your absolute path here
    backup_filename = f"{backup_destination}\\backup_dodo_datenbank.db"
    shutil.copy(path, backup_filename)

if __name__ == "__main__":
    backup_database()


# In[ ]:




