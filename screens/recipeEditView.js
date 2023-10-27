import { StatusBar } from 'expo-status-bar';
import { Button, Text, TextInput, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react' ;
import { doc, setDoc, collection, getDocs, deleteDoc, } from "firebase/firestore";
import { db } from '../components/config'

import { getNextId } from '../util/utils';


const RecipeEditPage = ({navigation, route}) => {
  const [list, editList] = useState([])
  const [ingList, editIngList] = useState([])
  const [searchTerm, editSearchTerm] = useState("")
  const [recipeDescription, editDescription] = useState("")
  const [recipeName, editName] = useState("")
  const [showCreate, setShowCreate] = useState(false);
  const [deleteFlag, setFlag] = useState(false);
  const [loadFlag, setLoadFlag] = useState(false)
  const savedId = route.params?.savedId
  const recipeData = route.params?.recipeData || {name: null, description: null, ingredients: null}
  let newIngredientName = "" 
  let newIngredientUnit = ""

  if(!loadFlag){
    setLoadFlag(true)
    loadRecipe()
    loadIngredients()
  }

  function loadRecipe(){
    if(recipeData.ingredients){
      editList(recipeData.ingredients)
    }
    editDescription(recipeData.description)
    console.log(recipeData.description)
    editName(recipeData.name)
  }

  async function loadIngredients(){
    await getDocs(collection(db, "ingredients"))
    .then((n) => { 
      const loadedIngredients = []
      n.forEach(doc => {
        const ingredientId = doc.id
        const ingredientData = doc.data()
        loadedIngredients.push({id: ingredientId, ...ingredientData})
        editIngList([...loadedIngredients])
      })
      console.log("Ing Data loaded")
    })
    .catch((error) => {
      console.log(error)
    });
  }


  async function createIngredient(data){
    await setDoc(doc(db, "ingredients", String(data.id)),{
     name: data.name,
     unit: data.unit
    })
    const newArr = ingList
    newArr.push(data)
    editIngList([...newArr])
  }


  function removeIngredient(dataId){
    const filteredArr = list.filter(n => n.id != dataId)
    editList([...filteredArr])
  }
  
  async function deleteIngredient(dataId){
    await deleteDoc(doc(db, "ingredients", String(dataId))) // Create in firebase
    const filteredArr = ingList.filter(n => n.id != dataId)
    editIngList([...filteredArr])
  }

  function searchForIngredient(name){
    const searchLenght = searchTerm.length
    const substring = name.substring(0,searchLenght)
    if(searchLenght === 0 || substring.toUpperCase() === searchTerm.toUpperCase()){
      return true
    }
    return false
  }

  function doesListContain(ingredientName){
    if(list.find((n) => n.name === ingredientName)){
      return true
    }
    return false
  }

  async function saveRecipe(data){
    await setDoc(doc(db, "recipeCollections", String(savedId.collectionId),"recipes" ,String(savedId.recipeId)),{
      name: data.name,
      ingredients: data.ingredients,  
      description: data.description,
      hasImage: data.hasImage
     }).catch((error) => {
      console.log(error)
    })
  }


  return (
    
    <View style={styles.container}>
      <View style={styles.recipeContainer}>
      <TextInput 
      defaultValue={recipeData.name}
      style={styles.textInputTitle}
      onChangeText={(txt) => editName(txt)}
      placeholder='Name here'/>

    </View>
      <View style={styles.recipeListContainer}>
      <FlatList
      data={list}
      renderItem={(ingredient) => 
      <View style={ {flexDirection:"row"}}>
        <Text style={styles.listItem}>{ingredient.item.name}</Text>
        <TextInput
        style={styles.listItemMisc}
        defaultValue={ingredient.item.amount}
        placeholder="0"
        keyboardType="numeric"
        onChangeText={(n) => {
          const newArr = [...list]
          const ingredientIndex = list.indexOf(ingredient.item)
          newArr[ingredientIndex].amount = n //!
          editList(newArr)
        }
      }/>
        <Text
        style={styles.listItemMisc}
        >{ingredient.item.unit}</Text>
        <Text style={styles.listItemMisc} onPress={()=> {
          removeIngredient(ingredient.item.id)
        }}>X</Text>
      </View>}
    />
    </View>
    <View style={styles.recipeFooter}>
    <TextInput 
      multiline
      defaultValue={recipeData.description}
      style={styles.descriptionInput}
      onChangeText={(txt) => editDescription(txt)}
      placeholder='Description here'/>

    <Button
      color={'#a9c1c8'}
      title='Finish recipe'
      onPress={() => {
        const newRecipe ={ 
          id: recipeData.id,
          name: recipeName,
          ingredients: [...list],
          description: recipeDescription,
          hasImage: recipeData.hasImage || false
      }
      saveRecipe(newRecipe)
      navigation.navigate("RecipeListPage")}}
    />
    </View>

    <View style={styles.ingredientContainer}>
      <View style={{flexDirection:"row"}}>
        <TouchableOpacity 
          style={deleteFlag ? styles.buttonInactive : styles.buttonActive}
          onPress={() => {setFlag(!deleteFlag)}}> 
          <Text style={styles.backgroundText}>Delete</Text>     
        </TouchableOpacity> 
        
        <TouchableOpacity
          color="black"
          style={styles.buttonActive}
          onPress={() => {
            setShowCreate(!showCreate)
          }}>
          <Text style={styles.backgroundText}>New Ingredient</Text>
        </TouchableOpacity>
      </View>
    
    {showCreate ? ( 
      <View>
        <View style={ {flexDirection:"row"}}>
          <TextInput
          style={styles.textInputTitle}
          onChangeText={(name) => newIngredientName = name}
          placeholder='Name'/>
          <TextInput
          style={styles.textInputTitle}
          onChangeText={(unit) => newIngredientUnit = unit}
          placeholder='Unit'/>
        </View>
        <TouchableOpacity
          title="Confirm"
          style={styles.buttonActive}
          onPress={() => {
            createIngredient({id: getNextId(ingList), name: newIngredientName, unit: newIngredientUnit})
            setShowCreate(!showCreate)
          }}
          >
            <Text style={styles.backgroundText}>Add</Text>
            </TouchableOpacity> 
        </View>
      ) : null}
    
    <TextInput
    placeholder='Search'
    onChangeText={(n) => editSearchTerm(n)}
    style={styles.searchBar}
    ></TextInput>
    
    

    
    <FlatList
      contentContainerStyle={{ paddingBottom: 30}}
      data={ingList}
      keyExtractor={ingredient => ingredient.name}
      renderItem={(ingredient) => {
        if(searchForIngredient(ingredient.item.name) && !doesListContain(ingredient.item.name)){ 
          return(
        <View style={ {flexDirection:"row"}}>
          <Text style={styles.listItem} onPress={()=>{
              if(deleteFlag){
                deleteIngredient(ingredient.item.id)
                setFlag(false)
              }else {
                editList([...list, ingredient.item])
              } 
            }}>{ingredient.item.name}</Text>
            <Text
            style={styles.listItemFiller}
            ></Text>
            <Text
            style={styles.listItemMisc}
            >{ingredient.item.unit}</Text>
        </View>
        )}}}
    />

    </View>
      <StatusBar style="auto" />
    </View>
    
  )
}


export default RecipeEditPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#a1e0e9",
  },
  textInputTitle:{
    backgroundColor:"#7eddf8",
    maxWidth:"100%",
    height: "100%",
    paddingLeft: 10,
    },
  recipeListContainer: {
    flex: 3,
  },
  recipeFooter: {
    flex: 3,
    backgroundColor:"#7eddf8",
  },
  recipeContainer: {
    flex: 1,
    backgroundColor: 'green'
  },
  ingredientContainer: {
    flex: 5
  },
  listItem:{
    minWidth: "40%",
    maxWidth: "40%",
    padding: 2,
    borderTopColor: "black",
    borderTopWidth: 1,
    paddingLeft: 15,
    },
  listItemFiller:{
    minWidth: "40%",
    maxWidth: "40%",
    padding: 2,
    borderTopColor: "black",
    borderTopWidth: 1,
    paddingLeft: 15,
    },
  listItemMisc:{
    minWidth: "20%",
    maxWidth: "20%",
    padding: 1,
    borderTopColor: "black",
    borderTopWidth: 1,
    paddingLeft: 15,
    },
  searchBar:{
    backgroundColor: "#a1e0e9",
    paddingLeft: 10,
    maxWidth:"100%",
    height: 25
  },
  descriptionInput:{
    backgroundColor:"#7eddf8",
    maxWidth:"100%",
    height: "200%",
    paddingLeft: 10,
    },
  buttons:{
    flexDirection: 'row',
  },
  buttonInactive:{
    backgroundColor: 'grey',
    borderTopColor: "black",
    borderTopWidth: 1,
    padding: 5,
    width: "50%"
  },
  buttonActive:{
    backgroundColor: '#a9c1c8',
    borderTopColor: "black",
    borderTopWidth: 1,
    padding: 5,
    width: "50%"
  },
  backgroundText:{
    color:"white"
  }
   });
