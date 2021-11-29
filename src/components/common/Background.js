import React, { Component } from 'react';
import { ImageBackground, TouchableWithoutFeedback, Keyboard, StyleSheet, Dimensions, View, SafeAreaView, KeyboardAvoidingView } from 'react-native';
//import { useSafeArea } from 'react-native-safe-area-context';
class Background extends Component {
    constructor(props) {
        super(props);
        this.state = {
            w: Dimensions.get('screen').width,
            h: Dimensions.get('screen').height
        };
        Dimensions.addEventListener('change', () => {
            let { width, height } = Dimensions.get('screen');
            this.setState({ w: width, h: height });
        });
    }

    render() {
        return (
            // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            //     <View style={{ flex: 1 }}>
            //         {this.props.children}
            //         <ImageBackground
            //             source={require('../../../assets/welcomebg.jpeg')}
            //             //style={[styles.image, { width: this.state.w, height: this.state.h} ]}
            //             //style={[styles.image, this.props.absolute ? { position: 'absolute' } : null ]}
            //             style={styles.image}
            //             blurRadius={this.props.blurRadius}
            //         />
            //     </View>
            // </TouchableWithoutFeedback>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                {this.props.children}
                <ImageBackground
                    source={require('../../../assets/welcomebg.jpeg')}
                    style={[styles.image, { width: this.state.w, height: this.state.h} ]}
                    //style={[styles.image, this.props.absolute ? { position: 'absolute' } : null ]}
                    //style={styles.image}
                    blurRadius={this.props.blurRadius}
                />
            </KeyboardAvoidingView>
        );
    }
};

// const Background = ({ blurRadius, children }) => {
//     const insets = useSafeArea();
//     return (
//         <KeyboardAvoidingView style={{ flex: 1 }}>
//             {children}
//             <ImageBackground
//                 source={require('../../../assets/welcomebg.jpeg')}
//                 //style={[styles.image, { width: this.state.w, height: this.state.h} ]}
//                 //style={[styles.image, this.props.absolute ? { position: 'absolute' } : null ]}
//                 style={styles.image}
//                 blurRadius={blurRadius}
//             />
//         </KeyboardAvoidingView>
//     );
// };

const styles = StyleSheet.create({
    image: {
        resizeMode: 'cover',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
        zIndex: -1,
        // very hacky fix pls fix this...
        //paddingBottom: 118
        // width: d.width,
        // height: d.height,
    }
});

export { Background };