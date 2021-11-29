import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, InteractionManager } from 'react-native';
import Options from './Options';
import db from '../../../Fire';
import { deleteCollection } from './Delete';
import { removeQuestion } from '../../redux/actions';
import { connect } from 'react-redux';
import { Interactive } from './Interactive';
import { Ionicons } from '@expo/vector-icons'; 
import { handleSubjectView } from './Subjects';
import { Loading } from '../common';
import { ImagePop } from '../common/ImagePop';

class Question extends Component {
	constructor(props) {
		super(props);
		this.state = {
			imageZoom: false,
			showDesc: false,
			loading: true
		};
		this.deleteQuestion = this.deleteQuestion.bind(this);
		this.subjects = handleSubjectView(this.props.subjects);
		this.changeImageZoom = this.changeImageZoom.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (this.state != nextState || this.props.dateCreated != nextProps.dateCreated || this.props.answersCount != nextProps.answersCount) {
			return true;
		}
		return false;
	}

	componentDidMount() {
		InteractionManager.runAfterInteractions(async () => {
			this.setState({ loading: false });
		});
	}

	changeImageZoom() {
		this.setState({ imageZoom: false });
	}

	async deleteQuestion() {
		const question = db.collection('questions').doc(this.props.questionId);
		// need to somehow add a for loop here to continuously delete
		await deleteCollection(question, 'likers', 50);
		await deleteCollection(question, 'answers', 50);
		await question.delete().catch(error => console.log(error.message));
		this.props.removeQuestion(this.props.questionId);
	}

	render() {
		const { container, body, section, item, questionTitle, questionTextContainer, questionText, createdText, owner, header, uploadedImage, userContainer, userInfo, profileImageContainer, profileImage, footer, extension, dropdown } = styles;
		let dateObj = new Date(this.props.dateCreated * 1000);
		let date = dateObj.getDate();
		let month = dateObj.getMonth()+1;
		let year = dateObj.getFullYear();
		//let hours = dateObj.getUTCHours();
		//let minutes = dateObj.getUTCMinutes();
		//let timeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
		let timeString = date + '/' + month + '/' + year;
		
		return (
			<View style={container}>
				{this.state.loading 
					? <Loading size={'small'} />
					: 
					<View>
						<View style={item}>
							<View style={header}>
								<View style={userContainer}>
									<View style={profileImageContainer}>
										{this.props.userImage ? <Image source={{ uri: this.props.userImage }} style={profileImage} /> : <View style={profileImage}></View>}
									</View>
									<View style={userInfo}>
										<Text style={owner}>{this.props.displayName}</Text>
										<Text style={createdText}>Created: {timeString}</Text>
									</View>
								</View>
								<Options 
									questionId={this.props.questionId} 
									handleEdit={this.props.handleEdit} 
									//editable={this.state.editable}
									//handleUpdate={this.handleUpdate}
									delete={this.deleteQuestion}
								/>
							</View>
							<View style={body}>
								<View style={section}>
									<Text style={questionTitle}>{this.props.questionTitle}</Text>
								</View>
								<View>
									{this.props.image 
										? 
										<TouchableOpacity onPress={() => this.setState({ imageZoom: true })}>
											<Image source={{ uri: this.props.image }} style={uploadedImage} />
										</TouchableOpacity>
										: null
									}
								</View>
								<ImagePop image={this.props.image} imageZoom={this.state.imageZoom} changeImageZoom={this.changeImageZoom} />
							</View>
							{this.subjects}
							<View style={footer}>
								<Interactive 
									docRef={db.collection('questions').doc(this.props.questionId)}
									refId={this.props.questionId}
									navigate={this.props.navigate} 
									answersCount={this.props.answersCount ? this.props.answersCount : 0}
									comment={this.props.comment}
								/>
							</View>
						</View>
						{this.props.questionText 
							?
							<View style={extension}>
								<View style={{ height: 10 }}></View>
								{this.state.showDesc
									? <View style={questionTextContainer}>
										<Text style={questionText}>{this.props.questionText}</Text>
									</View>
									: null
								}
								{/* <Text style={questionText}>{this.props.questionText}</Text> */}
								<TouchableOpacity style={dropdown} onPress={() => this.setState({ showDesc: !this.state.showDesc })}>
									<Ionicons name={this.state.showDesc ? 'ios-arrow-up' : 'ios-arrow-down'} size={25} />
								</TouchableOpacity>
							</View>
							: null
						}
					</View>
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 5,
		marginHorizontal: 16,
		alignItems: 'stretch',
	},

	item: {
		backgroundColor: 'white',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		alignItems: 'stretch',
	},

	body: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		marginBottom: 10,
	},

	section: {
		flexDirection: 'row',
		flex: 1,
		marginRight: 5
	},

	questionTitle: {
		fontSize: 17,
		fontWeight: '500',
		//textAlign: 'left',
	},

	questionTextContainer: {
		padding: 10
	},

	questionText: {
		fontSize: 14,
		fontWeight: '300'
	},

	editableQuestion: {
		fontSize: 20,
		borderColor: '#6ab8de',
		//borderColor: '#a5dbf5',
		borderRadius: 4,
		borderWidth: 3,
		backgroundColor: '#ffffff',
		paddingHorizontal: 5,
	},

	created: {
		marginTop: 10,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},

	createdText: {
		fontSize: 10,
		fontWeight: '100',
	},

	owner: {
		fontSize: 12,
	},

	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	
	userContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},

	userInfo: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyContent: 'center'
	},

	headerButtonView: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	headerButton: {
		paddingHorizontal: 5,
	},

	profileImageContainer: {
		width: 30,
		height: 30,
		borderRadius: 15,
		overflow: 'hidden',
		marginRight: 10
	},

	profileImage: {
		width: 30,
		height: 30,
	},

	uploadedImage: {
		//width: '100%', 
		//height: 200,
		width: 100,
		height: 100,
		resizeMode: 'contain',
		borderRadius: 10,
		marginBottom: 10,
	},

	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	
	extension: {
		minHeight: 34,
		marginHorizontal: 8,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: '#c6c6c6',
		bottom: 10,
		zIndex: -1,
		alignItems: 'stretch'
	},

	dropdown: {
		marginHorizontal: 20
	}
});

export default connect(
	null,
	{ removeQuestion }
)(Question);