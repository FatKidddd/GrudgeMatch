import React, { Component, Fragment } from 'react';
import { FlatList, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, Dimensions, View, InteractionManager } from 'react-native';
import { Loading, Background } from '../../components/common'
import { connect } from 'react-redux';
import Answer from '../../components/questions/Answer';
import { getAnswers, overwriteAnswers } from '../../redux/actions';
import { getAnswersByQuestionId, getQuestionById } from '../../redux/selectors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
//import Search from './Search';
import db from '../../../Fire';
import Question from '../../components/questions/Question';
import SubmitAnswerScreen from './SubmitAnswer';

// changed screen props to redux
class AnswersListScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allLoading: true,
            loading: false,
            onEndReachedCalledDuringMomentum: true,
            refreshing: false,
        };
        this.answerRef;
        this.onRefresh = this.onRefresh.bind(this);
        this._loadMoreData = this._loadMoreData.bind(this);
        this._onMomentumScrollBegin = this._onMomentumScrollBegin.bind(this);
	}

    async shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.route.params != null) {
            this.onRefresh();
            nextProps.route.params = null;
        }
        if (nextProps.answers != this.props.answers && this.state.loading) {
            this.setState({ loading: false });
        } else if (this.state.loading) {
            setTimeout(() => {
                this.setState({ loading: false });
            }, 500);
        }
        return false;
    }

    componentDidMount() {
        // 1: Component is mounted off-screen
        InteractionManager.runAfterInteractions(() => {
            this.setState({ allLoading: false });
            if (this.props.questionId) {
                this.answerRef = db.collection('questions').doc(this.props.questionId).collection('answers');
                if (this.props.answers.length === 0) {
                    this.setState({ loading: true });
                    this.props.getAnswers(this.answerRef, this.props.questionId);
                }
            } else {
                this.props.navigation.navigate('QuestionsList');
            }
        });
    }

    componentWillUnmount() {

    }

    _onMomentumScrollBegin = () => this.setState({ onEndReachedCalledDuringMomentum: false });

    _loadMoreData = () => {
        if (!this.state.loading) {
            this.setState({ onEndReachedCalledDuringMomentum: true, loading: true }, () => {
                this.props.getAnswers(this.answerRef, this.props.questionId);
            });
        };
    };

    renderFooter() {
        if (this.state.loading) return <Loading size='small' style={{ height: 100 }} />
        return null;
    }

    wait(timeout) {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    async onRefresh() {
        this.setState({ refreshing: true });
        await this.props.overwriteAnswers(this.answerRef, this.props.questionId);
        this.setState({ refreshing: false });
    }

    render() {
        return (
            <Fragment>
            <Background>
                {this.state.allLoading
                    ? <View style={{ marginTop: 100 }}><Loading size={'large'} /></View>
                    :  <SafeAreaView style={styles.container}>
                        <FlatList
                            data={this.props.answers}
                            renderItem={({ item, index }) =>
                                <Answer
                                    key={'listAnswer-' + item.id}
                                    questionId={this.props.questionId}
                                    answerId={item.id}
                                    answerText={item.answerText}
                                    dateCreated={item.dateCreated.seconds}
                                    subject={item.subject}
                                    displayName={item.displayName}
                                    userImage={item.profilePicture}
                                    image={item.image}
                                />
                                // <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1}}>
                                //     <Text>Hi</Text>
                                // </View>
                            }
                            keyExtractor={item => 'listAnswer-' + item.id}
                            onEndReached={this._loadMoreData}
                            onEndReachedThreshold={0}
                            onMomentumScrollBegin={this._onMomentumScrollBegin}
                            initialNumToRender={3}
                            keyboardShouldPersistTaps={'handled'}
                            ListFooterComponent={this.renderFooter.bind(this)}
                            ListHeaderComponent={
                                <Question
                                    questionId={this.props.questionId}
                                    questionTitle={this.props.question.questionTitle}
                                    questionText={this.props.question.questionText}
                                    dateCreated={this.props.question.dateCreated.seconds}
                                    subjects={this.props.question.subjects}
                                    displayName={this.props.question.displayName}
                                    userImage={this.props.question.profilePicture}
                                    image={this.props.question.image}
                                />
                            }
                            refreshControl={
                                <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                            }
                        />
                    </SafeAreaView>
                }
            </Background>
                <SubmitAnswerScreen
                    dataRef={this.answerRef}
                    questionId={this.props.questionId}
                    navigation={this.props.navigation}
                />
            </Fragment>
        );
    }
};

const mapStateToProps = (state, ownProps) => {
    let questionId = state.QUESTIONS.currQuestionId;
    return {
        answers: getAnswersByQuestionId(state, questionId).answers,
        question: getQuestionById(state, questionId),
        questionId: questionId,
        users: state.USER.users
    };
};

export default connect(
    mapStateToProps,
    { getAnswers, overwriteAnswers }
)(AnswersListScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },

    answer: {
        fontSize: 20,
    },

    subject: {
        fontSize: 18,
        textDecorationLine: "underline",
        marginBottom: 10,
    },

    created: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    createdText: {
        fontSize: 12,
        fontWeight: '100',
    },

    owner: {
        fontSize: 14,
        marginBottom: 10,
    },

    interactive: {

    },

    answer: {
        fontSize: 18,
        fontWeight: '300',
    },
});
