import { StatusBar } from 'expo-status-bar';
import { Button, Text, View, FlatList, Image, StyleSheet } from 'react-native';
import { useState } from 'react' ;
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from '../components/config'
import * as ImagePicker from "expo-image-picker"
import { ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage"


const RecipePage = ({navigation, route}) => {
  const recipeData = route.params?.recipeData 
  const savedId = route.params?.savedId
  const [imagePath, setImagePath] = useState(null)
  const [ImgFlag, setImgFlag] = useState(false)
  const [uploadFlag, setUploadFlag] = useState(false)
 
  if(uploadFlag){
    setUploadFlag(false) 
    uploadImage() 
  }

  if(!ImgFlag && recipeData.hasImage){
    setImgFlag(true)
    downloadImage()
  }

  async function launchImagePicker(){
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    })
    if(!result.canceled){
      setImagePath(result.assets[0].uri)
      setUploadFlag(true) 
    }
  }

  async function updateHasImage(imageStatus){
    await updateDoc(doc(db, "recipeCollections", String(savedId.collectionId),"recipes" ,String(savedId.recipeId)),{
      hasImage:imageStatus
     }).catch((error) => {
      console.log(error)
    })
  }


  async function deletePrevImg(){
    const delRef = ref(storage, `Image${recipeData.id}.jpg`)
    await deleteObject(delRef).then(() => {
    }).catch((error) => {
      console.log(error)
    })
  }

  async function uploadImage(){
    if(recipeData.hasImage){
      await deletePrevImg()
    }
    const res = await fetch(imagePath)
    const blob = await res.blob()
    const storageRef = ref(storage,`Image${recipeData.id}.jpg`)
    uploadBytes(storageRef, blob).then((snapshot) => {
      updateHasImage(true)
      alert("image uploaded")
    })
  }

  async function downloadImage(){
    getDownloadURL(ref(storage, `Image${recipeData.id}.jpg`))
    .then((url) => {setImagePath(url)
    }).catch((error) => {
      console.log("fejl i image dowload " + error)
    })

  }

  return (

    <View style={styles.container}>
      <Text style={styles.title}>{recipeData.name || null}</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={recipeData.ingredients || null}
          renderItem={(ingredient) => 
          <View style={{flexDirection:"row"}}>
          <Text style={styles.listItem}>
            {ingredient.item.name}
          </Text>
          <Text style={styles.listItemMisc}>
            {ingredient.item.amount}
          </Text>
          <Text style={styles.listItemMisc}>
            {ingredient.item.unit}
          </Text>
          </View>
          }
        />
      </View>
      <View
      style={styles.description}
      >
      <Text>{recipeData.description || null}</Text>
      </View>

      <View style={styles.imageContainer} >
        <Image style={styles.image} source={{uri:imagePath}}/>
      </View>

      <Button
        color={"grey"}
        title='Pick image'
        onPress={launchImagePicker}
      />


      <Button
        color={"grey"}
        title='Edit recipe'
        onPress={() => navigation.navigate("RecipeEditPage", {recipeData: recipeData, savedId: savedId})}
      />

      <StatusBar style="auto" />
    </View>

  )

}

export default RecipePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#a1e0e9",
  },
  title:{
    backgroundColor:"#7eddf8",
    borderBottomColor:"black",
    borderBottomWidth: 1,
    padding: 10
  },
  listContainer:{
    flex: 1
  },
  description:{
    flex: 1,
    backgroundColor:"#7eddf8",
    borderTopColor:"black",
    borderTopWidth: 1,
    borderBottomColor:"black",
    borderBottomWidth: 1,
    padding: 10
  },
  listItem:{
    minWidth: "70%",
    maxWidth: "70%",
    padding: 2,
    paddingLeft: 15,
    },
  listItemMisc:{
    minWidth: "15%",
    maxWidth: "15%",
    padding: 2,
    paddingLeft: 15,
    },
  image:{
    flex: 1,
    width:100,
    height:100,
    marginBottom: 10
  },
  imageContainer:{
    justifyContent:"center",
    alignItems: "center",
  }
   });