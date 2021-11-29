import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QuestionsListScreen from './QuestionsList';
//import DetailedQuestion from './DetailedQuestion';
import { TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SubmitQuestionScreen from './SubmitQuestion';
import SubmitAnswerScreen from './SubmitAnswer';
import AnswersListScreen from './AnswersList';
import { View } from 'react-native';
import { BackButton } from '../../components/common/BackButton';

// const Question = createStackNavigator();
// changed to bottom tab navigator because it's faster.
const Question = createStackNavigator();

function getHeaderTitle(route) {
    const routeName = route.name || 'Auth';

    switch (routeName) {
        case 'QuestionsList':
            return 'Questions';
        case 'AnswersList':
            //return 'Detailed Question';
            return 'Answers';
        case 'SubmitQuestion':
            return 'Post Question';
        case 'SubmitAnswer':
            return 'Post Reply';
    }
}

class QuestionsScreen extends Component {    
    render() {
        return (
            <Question.Navigator
                screenOptions={() => ({
                    headerStyle: { backgroundColor: '#001e3c' },//'#246887' },
                    headerTitleStyle: { color: 'white' },
                })}
            >
                <Question.Screen 
                    options={({ route }) => ({
                        title: getHeaderTitle(route),
                        headerShown: true,
                        headerLeft: () => (
                            <BackButton 
                                onPress={() => {
                                    this.props.navigation.navigate('Home');
                                }}
                                size={30}
                            />
                        ),
                        headerRight: () => (
                            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                {/* <TouchableOpacity onPress={this.handleSearchOpen}>
                                        <Ionicons size={30} name='md-search' style={{ paddingHorizontal: 10 }} />
                                    </TouchableOpacity> */}
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('SubmitQuestion')} style={{ paddingLeft: 20, paddingVertical: 5 }}>
                                    <MaterialCommunityIcons size={30} name='plus' style={{ paddingHorizontal: 10, color: 'white' }} />
                                </TouchableOpacity>
                            </View>
                        )
                    })}
                    name='QuestionsList' 
                    component={QuestionsListScreen} 
                />
                {/* <Question.Screen 
                    options={({ route }) => ({
                        title: getHeaderTitle(route)
                    })}
                    name='QuestionsSingle' 
                    component={DetailedQuestion} 
                /> */}
                <Question.Screen 
                    options={({ route }) => ({
                        title: getHeaderTitle(route),
                        headerLeft: () => (
                            <BackButton
                                onPress={() => {
                                    this.props.navigation.navigate('QuestionsList');
                                }}
                                size={30}
                            />
                        )
                    })}
                    name='AnswersList' 
                    component={AnswersListScreen}
                />
                <Question.Screen 
                    options={({ route }) => ({
                        title: getHeaderTitle(route),
                        headerLeft: () => (
                            <BackButton
                                onPress={() => {
                                    this.props.navigation.navigate('QuestionsList');
                                }}
                                size={30}
                            />
                        )
                    })}
                    name='SubmitQuestion' 
                    component={SubmitQuestionScreen} 
                />
                {/* <Question.Screen 
                    options={({ route }) => ({
                        title: getHeaderTitle(route),
                        headerLeft: () => (
                            <BackButton
                                onPress={() => {
                                    this.props.navigation.navigate('AnswersList');
                                }}
                                size={30}
                            />
                        )
                    })}
                    name='SubmitAnswer' 
                    component={SubmitAnswerScreen} 
                /> */}
            </Question.Navigator>
        );
    }
}

export default QuestionsScreen;

