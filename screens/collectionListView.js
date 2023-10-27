import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react' ;
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from '../components/config'

import { getNextId } from '../util/utils';


const FrontPage = ({navigation, route}) => {
  const [list, editList] = useState([])
  const [showCreate, setShowCreate] = useState(false);
  const [deleteFlag, setFlag] = useState(false);
  const [loadFlag, setLoadFlag] = useState(false)
  let newCollectionName = "Unnamed"
  
  if(!loadFlag){
    setLoadFlag(true)
    loadCollections()
  }

  async function loadCollections(){
    await getDocs(collection(db, "recipeCollections"))
    .then((n) => { 
      const loadedCollections = []
      n.forEach(doc => {
        const collectionId = doc.id
        const collectionData = doc.data()
        loadedCollections.push({id: collectionId, ...collectionData})
        editList([...loadedCollections])
      })
      console.log("Data loaded")
    })
    .catch((error) => {
      console.log(error)
    });
  }

  async function createCollection(data){
    await setDoc(doc(db, "recipeCollections", String(data.id)), {
      name: data.name
    }).then(() => {
      console.log("Data submitted")
    }).catch((error) => {
      console.log(error)
    });
  }

  async function deleteCollection(dataId){
    await deleteDoc(doc(db, "recipeCollections", String(dataId)))
    const filteredArr = list.filter(n => n.id != dataId)
    editList([...filteredArr])
  }


  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Cookbooks</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={deleteFlag ? styles.buttonInactive : styles.buttonActive}
          title='Delete'
          onPress={() => {setFlag(!deleteFlag)}}> 
          <Text style={styles.backgroundText}>Delete</Text>     
        </TouchableOpacity> 
        
        <TouchableOpacity
          color="black"
          title='Create Collection'
          style={styles.buttonActive}
          onPress={() => {
            setShowCreate(!showCreate)
          }}>
          <Text style={styles.backgroundText}>Create Collection</Text>
        </TouchableOpacity>
    </View>
    
    {showCreate ? ( 
      <View>
        <TextInput
        style={styles.create}
        onChangeText={(name) => newCollectionName = name}
        placeholder='Enter name'/>
        <TouchableOpacity
          title="Confirm"
          style={styles.confirm}
          onPress={() => {
            const newCollection = {id:getNextId(list), name: `${newCollectionName}`}
            editList([...list, newCollection])
            createCollection(newCollection)
            setShowCreate(!showCreate)
          }}>
            <Text style={styles.backgroundText}>Confirm</Text>
            </TouchableOpacity> 
        </View>
      ) : null}
    

    <FlatList
        data={list}
        renderItem={(cookbook) => <Text style={styles.listItem} onPress={()=>{
          if(deleteFlag){
            deleteCollection(cookbook.item.id)
            setFlag(false)
          } else{
            navigation.navigate("RecipeListPage", {collectionId: cookbook.item.id})}}}>{cookbook.item.name}</Text>}
    />
    <StatusBar style="auto" />
  </View>
  )
}

export default FrontPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#a1e0e9",
  },
  title: {
    backgroundColor:"#7eddf8",
    fontWeight: "bold",
    fontFamily: 'monospace',
    fontSize: 25,
    textAlign:"center",
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  create:{
    backgroundColor: "#a1e0e9",
    borderBottomColor: "#1677ac",
    borderBottomWidth: 1,
    height: 25,
    paddingLeft: 10
  },
  confirm:{
    borderBottomColor: "#1677ac",
    borderBottomWidth: 1,
    padding: 5,
    backgroundColor: '#a9c1c8',
    padding: 5,
  },
  listItem:{
    width: '100%',
    padding: 2,
    borderTopColor: "black",
    borderTopWidth: 1,
    paddingLeft: 10,
    },
  buttons:{
    flexDirection: 'row',
  },
  buttonInactive:{
    backgroundColor: 'grey',
    padding: 5,
    width: 160
  },
  buttonActive:{
    backgroundColor: '#a9c1c8',
    padding: 5,
    width: 160
  },
  backgroundText:{
    color:"white"
  }
   });
