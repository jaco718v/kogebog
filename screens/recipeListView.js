import { StatusBar } from 'expo-status-bar';
import { Text, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react' ;
import { doc, collection, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { db } from '../components/config'

import { getNextId } from '../util/utils';


const RecipeListPage = ({navigation, route}) => {
  const collectionId = route.params?.collectionId
  const [list, editList] = useState([])
  const [deleteFlag, setFlag] = useState(false);
  const [loadFlag, setLoadFlag] = useState(false)


  if(!loadFlag){
    setLoadFlag(true)
    loadRecipes()
  }


  async function loadRecipes(){
    const collectionRef = collection(db, "recipeCollections", String(collectionId), "recipes")
    const q = query(collectionRef, ref => ref.orderBy('createdAt', 'desc'))
    onSnapshot(q, snapshot =>{ 
    const loadedRecipes = []
    snapshot.forEach(doc => {
      loadedRecipes.push({id: doc.id, ...doc.data()}) 
    })
    editList([...loadedRecipes])
  })
}   

  async function deleteRecipe(dataId){
    await deleteDoc(doc(db, "recipeCollections", String(dataId)))
    const filteredArr = list.filter(n => n.id != dataId)
    editList([...filteredArr])
  }

  return (

<View style={styles.container}>

  <View style={styles.buttons}>
    <TouchableOpacity 
      style={deleteFlag ? styles.buttonInactive : styles.buttonActive}
      title='Delete'
      onPress={() => {setFlag(!deleteFlag)}}> 
      <Text style={styles.backgroundText}>Delete</Text>     
    </TouchableOpacity> 
     
    <TouchableOpacity
      color="black"
      title='Create Recipe'
      style={styles.buttonActive}
      onPress={() => {
        navigation.navigate("RecipeEditPage", {savedId: {collectionId: collectionId, recipeId:getNextId(list)}})}}>
      <Text style={styles.backgroundText}>Create Recipe</Text>
    </TouchableOpacity>
  </View>


  <FlatList
      data={list}
      renderItem={(recipe) => 
      <Text style={styles.listItem} onPress={()=>{
        if(deleteFlag){
          deleteRecipe(recipe.item.id)
          setFlag(false)
        } else{
          navigation.navigate("RecipePage", {recipeData: recipe.item, savedId: {collectionId: collectionId, recipeId:recipe.item.id}})}}}>{recipe.item.name}</Text>}
  />
  <StatusBar style="auto" />

</View>
  )
}

export default RecipeListPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#a1e0e9"
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
    width: 180
  },
  buttonActive:{
    backgroundColor: '#a9c1c8',
    padding: 5,
    width: 180
  },
  backgroundText:{
    color:"white"
  }
   });
