import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FrontPage from './screens/collectionListView';
import RecipeListPage from './screens/recipeListView';
import RecipeEditPage from './screens/recipeEditView';
import RecipePage from './screens/recipeDetailView';

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='FrontPage'>
        <Stack.Screen
          name='FrontPage'
          component={FrontPage}
        />
        <Stack.Screen
          name='RecipeListPage'
          component={RecipeListPage}
        />
        <Stack.Screen
          name='RecipeEditPage'
          component={RecipeEditPage}
        />
        <Stack.Screen
          name='RecipePage'
          component={RecipePage}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}






