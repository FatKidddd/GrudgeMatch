import React, { Component } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { connect } from 'react-redux';
import { setUser } from '../../redux/actions';
import { Loading, Background } from '../../components/common';
import { handleSubjectView } from '../../components/questions/Subjects';

class ProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subjects: [],
            year: null,
            displayName: this.props.displayName,
        }
        this.subjects = handleSubjectView(this.props.subjects);
    }

    setSubjects() {

    }

    render() {
        const { dateCreated, displayName, profilePicture, subjects } = this.props.data;
        const { page, container, profileImageContainer, profileImage, details, row, detailsText } = styles;
        
        let dateObj = new Date(dateCreated * 1000);
        let date = dateObj.getDate();
        let month = dateObj.getMonth() + 1;
        let year = dateObj.getFullYear();
        let timeString = date + '/' + month + '/' + year;

        return (
            <Background blurRadius={0}>
                <View style={page}>
                    <View style={container}>
                        <View style={profileImageContainer}>
                            {profileImage ? <Image source={{ uri: profilePicture }} style={profileImage} /> : null}
                        </View>
                        <View style={details}>
                            <View style={row}>
                                <Text style={detailsText}>Name: </Text>
                                <Text style={detailsText}>{displayName}</Text>
                            </View>
                            <View style={row}>
                                <Text style={detailsText}>Subjects</Text>
                                {this.subjects}
                            </View>
                            <View style={row}>
                                <Text style={detailsText}>Account Created On: </Text>
                                <Text style={detailsText}>{timeString}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Background>
        );
    }
}

const mapStateToProps = state => {
    return {
       data: state.USER.data
    };
};

export default connect(
    mapStateToProps,
    { setUser }
)(ProfileScreen);

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center'
    },

    container: { 
        flex: 0.9,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: 70,
        marginHorizontal: 10,
        padding: 10,
    },
    
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginRight: 10,
        alignSelf: 'center',
        marginVertical: 20
    },

    profileImage: {
        width: 120,
        height: 120,
    },

    details: {
        flex: 1,
        justifyContent: 'space-evenly'
    },

    row: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderColor: '#dddddd',
        borderTopWidth: 2,
        paddingHorizontal: 20
    },

    detailsText: {
    }
})