import React from 'react';
import FeedbackScreen from '../screens/Feedback';
import QuestionsScreen from '../screens/questions/QuestionsScreen';
import ArtsScreen from '../screens/Arts';
//import QuizScreen from '../screens/Quiz';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import LoggedInDrawer from './LoggedInDrawer';

const Tab = createMaterialBottomTabNavigator();

const LoggedInTabNavigator = ({ navigation, route }) => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color }) => {
					let iconName;
					if (route.name == "LoggedInDrawer") {
						iconName = "ios-home";
					} else if (route.name == "Questions") {
						iconName = "ios-help-circle";
					} else if (route.name == "Feedback") {
						iconName = "ios-mail";
					} else if (route.name == "Arts") {
						iconName = "md-color-palette";
					} else if (route.name == "Quiz") {
						iconName = "logo-buffer";
					} else if (route.name == "EditStack") {
						iconName = "ios-paper";
					}
					return <Ionicons name={iconName} size={25} color={color} />;
				},
			})}
			//activeColor="#e91e63"
			barStyle={{ backgroundColor: '#001e3c' }}
		>
			<Tab.Screen
				options={({ navigation }) => ({
					tabBarLabel: 'Home',
				})}
				name='LoggedInDrawer'
				component={LoggedInDrawer}
			/>
			<Tab.Screen 
				name='Arts' 
				component={ArtsScreen}
			/>
			<Tab.Screen 
				name='Questions' 
				component={QuestionsScreen}
				options={({ navigation }) => ({
					tabBarVisible: false
				})}
			/>
			{/* <Tab.Screen name='Quiz' component={QuizScreen}/> */}
			<Tab.Screen name='Feedback' component={FeedbackScreen}/>
		</Tab.Navigator>
	);
}

export default LoggedInTabNavigator;