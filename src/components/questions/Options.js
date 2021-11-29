import React, { Component } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalSelector from 'react-native-modal-selector'
import { Alert } from 'react-native';

class Options extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false
        };
    }
    
    handleChosen(option) {
        switch (option.label) {
            case 'Edit': 
                this.props.handleEdit();
                break
            case 'Update': 
                this.props.handleUpdate();
                this.props.handleEditable();
                break
            case 'Delete':
                this.setState({ modalVisible: false }, () => {
                    setTimeout(() => {
                        this.handleDelete();
                    }, 1000);
                });
                break
            case 'Report': 
                break
            default:
                console.log('Nani!');
                break
        }
    }

    handleDelete(id) {
        Alert.alert(
            'Delete',
            'Are you sure you want to delete this?',
            [
                { text: 'No', onPress: () => { } },
                { text: 'Yes', onPress: () => this.props.delete() }
            ],
            { cancelable: false },
        );
    }

    render() {
        //const { container } = styles;
        let index = 0;
        const data = [
            { key: index++, section: true, label: 'Options' },
            { key: index++, label: this.props.editable ? 'Update' : 'Edit' },
            { key: index++, label: 'Delete' },
            { key: index++, label: 'Report' }
        ];

        return (
            // <TouchableOpacity onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}>
            <ModalSelector
                data={data}
                initValue="Options"
                supportedOrientations={['portrait', 'landscape']}
                accessible={true}
                scrollViewAccessibilityLabel={'Scrollable options'}
                cancelButtonAccessibilityLabel={'Cancel Button'}
                onChange={(option) => { this.handleChosen(option) }}
                visible={this.state.modalVisible}
                cancelText={'Cancel'}
                // onModalClose={() => this.setState({ modalVisible: !this.state.modalVisible })}
            >
                <MaterialCommunityIcons name='dots-horizontal' size={30} style={{ padding: 5, color: '#cccccc' }} />
            </ModalSelector>
            // </TouchableOpacity>
        );
    }
}

export default Options;