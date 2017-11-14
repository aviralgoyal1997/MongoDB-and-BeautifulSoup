import pymongo
from pymongo import MongoClient

client=MongoClient('localhost',27017)
## used mongoimport in mongodb folder in program files to import statio.json into mongo database
# code to be written in command prompt( mongoimport --jsonArray --db users --collection --file statio.json)

db=client.users
collec=db.contacts
#for post in collec.find():
    #print (post)
qw=(db.contacts.find({'parking':'yes','wheelchair':'yes'},{'name':1,'_id':0}))
for i in qw:
    print (i)
