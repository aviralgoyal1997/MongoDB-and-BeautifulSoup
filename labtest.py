import bs4 as bs
from bs4 import BeautifulSoup
import urllib.request
import pandas as pd
import numpy as np
source=urllib.request.urlopen('file:///C:/Users/Student/Desktop/test.html').read()
soup=BeautifulSoup(source,'html.parser')
table=soup.find_all('tbody')
table_use=table[4]
'''titles=table_use.find_all('td',class_='title')
amenities=table_use.find_all('td',class_='amenities')

ta=[]
for i in range(1,25):
    t=titles[i].text
    ta.append(t)
station=pd.DataFrame()
station['name']=np.array(ta)
parking=[]
access=[]
for i in range(0,25):
    p=amenities[0]
    if(p==[]):
        parking'''

entries=table[4].find_all('tr')
name=[]
url=[]
for i in range(1,25):
    name.append(entries[i].find('td',class_='title').text)
    url.append(entries[i].find('td',class_='scheduletext').find('a').get('href'))
amenities={}
for i in range(1,25):
    amenities[i]=entries[i].find('td',class_='amenities').find_all('img')
parking=[]
wheelchair=[]
for i in range(1,25):
    if (len(amenities[i])==2):
        parking.append('yes')
        wheelchair.append('yes')
    if (len(amenities[i])==1):
        parking.append('no')
        wheelchair.append('yes')
    if (len(amenities[i])==0):
        parking.append('no')
        wheelchair.append('no')
station=pd.DataFrame()
station['name']=np.array(name)
station['parking']=np.array(parking)
station['wheelchair']=np.array(wheelchair)
station['url']=np.array(url)

oi=[]
for i in range(0,24):
    oi.append(station['name'][i].split('\n')[1])
station['name']=np.array(oi)
station.to_csv('statio_data.csv')
#convert that csv to json or simply import csv file to mongod


        
    
    

    





    
