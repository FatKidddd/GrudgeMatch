import React from 'react';
import { StyleSheet, View, Text } from "react-native";

export const subjectIdName = [
    {
        id: '1',
        name: 'Literature'
    }, {
        id: '2',
        name: 'Chinese'
    }, {
        id: '3',
        name: 'Geography'
    }, {
        id: '4',
        name: 'History'
    }, {
        id: '5',
        name: 'Economics'
    }, {
        id: '6',
        name: 'Anthropology'
    }, {
        id: '7',
        name: 'Chemistry'
    }, {
        id: '8',
        name: 'Physics'
    }, {
        id: '9',
        name: 'Biology'
    }, {
        id: '10',
        name: 'Mathematics'
    }, {
        id: '11',
        name: 'ELCT'
    }, {
        id: '12',
        name: 'TOK'
    }
];

export const subjects = {
    '1': 'Literature',
    '2': 'Chinese',
    '3': 'Geography',
    '4': 'History',
    '5': 'Economics',
    '6': 'Anthropology',
    '7': 'Chemistry',
    '8': 'Physics',
    '9': 'Biology',
    '10': 'Mathematics',
    '11': 'ELCT',
    '12': 'TOK',
    '13': 'CAS',
    '14': 'EE'
};

export const subjectColors = {
    'Biology': 'green',
    'Physics': 'pink',
    'Chemistry': '#47e066',
    'Chinese': 'orange',
    'Geography': 'darkblue',
    'History': 'darkred',
    'Economics': 'black',
    'Anthropology': 'lightskyblue',
    'Literature': 'purple',
    'Mathematics': 'red',
    'ELCT': 'deepskyblue',
    'TOK': 'darkgoldenrod',
    'CAS': 'lightcoral',
    'EE': 'lavender'
};


export const handleSubjectView = (givenSubjects) => {
    const { subjectContainer, subjectView, subject } = styles;

    let allSubComp = []
    for (let key in givenSubjects) {
        let id = givenSubjects[key];
        let subjectName = subjects[id];
        let subjectColor = subjectColors[subjectName] ? subjectColors[subjectName] : '#cccccc';
        let one = <View key={id} style={[subjectView, { backgroundColor: subjectColor }]}>
                    <Text style={subject}>{subjectName}</Text>
                </View>;
        allSubComp.push(one);
    }

    return (
        <View style={subjectContainer}>
            {allSubComp}
        </View>
    );
};

const styles = StyleSheet.create({
    subjectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

    subjectView: {
        backgroundColor: '#dddddd',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 5
    },

    subject: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600'
    }
});