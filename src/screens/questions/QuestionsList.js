import React, { Component } from 'react';
import { Text, View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, InteractionManager } from 'react-native';
import { Loading, Background } from '../../components/common'
import { connect } from 'react-redux';
import Question from '../../components/questions/Question';
import { getQuestions, overwriteQuestions, getUsers, setCurrQuestionId, setCurrentEditId } from '../../redux/actions';
//import Search from './Search';
import db from '../../../Fire';

// replaced resetQuestions with overwriteQuestions
class QuestionsListScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			allLoading: true,
			loading: false,
			onEndReachedCalledDuringMomentum: true,
			refreshing: false
		};
		this.onRefresh = this.onRefresh.bind(this);
		this.questionRef = db.collection('questions');
		this.handleEdit = this.handleEdit.bind(this);
		this.navigate = this.navigate.bind(this);
		this._loadMoreData = this._loadMoreData.bind(this);
		this._onMomentumScrollBegin = this._onMomentumScrollBegin.bind(this);
	}

	async shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.route.params != null) {
			this.onRefresh();
			nextProps.route.params = null;
		}
		if (nextProps.questions != this.props.questions && this.state.loading) {
			this.setState({ loading: false });
		}
		return false;
	}

	componentDidMount() {
		InteractionManager.runAfterInteractions(() => {
			if (this.props.questions.length == 0) {
				this.setState({ loading: true });
				this.props.getQuestions(this.questionRef);
			}
			this.setState({ allLoading: false });
		});
	}

	_onMomentumScrollBegin = () => this.setState({ onEndReachedCalledDuringMomentum: false });

	_loadMoreData = () => {
		//!this.state.onEndReachedCalledDuringMomentum && 
		if (!this.state.loading) {
			this.setState({ onEndReachedCalledDuringMomentum: true, loading: true }, () => {
				this.props.getQuestions(this.questionRef);
			});
		};
	};

	// shifted all data management to redux

	renderFooter() {
		if (this.state.loading) return <Loading size='small' style={{ height: 100 }}/>
		return null;
	}

	async onRefresh() {
		this.setState({ refreshing: true });
		await this.props.overwriteQuestions(this.questionRef);
		this.setState({ refreshing: false });
	}

	handleEdit(item) {
		requestAnimationFrame(() => {
			this.props.navigation.navigate('SubmitQuestion', { 
				questionId: item.id, 
				questionTitle: item.questionTitle, 
				questionText: item.questionText, 
				image: item.image, 
				subjects: item.subjects 
			});
		});
	}

	navigate(id) {
		requestAnimationFrame(() => {
			this.props.setCurrQuestionId(id);
			this.props.navigation.navigate('AnswersList');
		});
	}

	render() {
		return (
			<Background>
				{this.state.allLoading
					? <View style={{ marginTop: 100 }}><Loading size={'large'} /></View>
					: <SafeAreaView style={styles.container}>
						<FlatList
							data={this.props.questions}
							renderItem={({ item, index }) => 
								<Question 
									key={'listQuestion-' + item.id}
									questionId={item.id}
									questionTitle={item.questionTitle}
									questionText={item.questionText} 
									dateCreated={item.dateCreated.seconds} 
									subjects={item.subjects} 
									displayName={item.displayName}
									userImage={item.profilePicture}
									image={item.image}
									answersCount={item.answersCount}
									navigate={() => this.navigate(item.id)}
									comment={true}
									handleEdit={() => this.handleEdit(item)}
								/>
							}
							keyExtractor={item => 'listQuestion-' + item.id}
							onEndReached={this._loadMoreData}
							onEndReachedThreshold={0.5}
							onMomentumScrollBegin={this._onMomentumScrollBegin}
							initialNumToRender={3}
							keyboardShouldPersistTaps={'handled'}
							ListFooterComponent={this.renderFooter.bind(this)}
							refreshControl={
								<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
							}
						/>
					</SafeAreaView>
				}
			</Background>
		);
	}
};

const mapStateToProps = state => {
	return {
		questions: state.QUESTIONS.questions,
		lastVisible: state.QUESTIONS.lastVisible,
	};
};


export default connect(
	mapStateToProps,
	{ getQuestions, overwriteQuestions, getUsers, setCurrQuestionId, setCurrentEditId }
)(QuestionsListScreen);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%'
	},
});
{/* <Search modalVisible={this.state.searchOpen} handleSearchOpen={this.handleSearchOpen} handleFilter={this.handleFilter} /> */ }