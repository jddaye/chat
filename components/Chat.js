import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { GiftedChat } from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView } from 'react-native';

export default class Chat extends React.Component {
  
  constructor(){
    super();
    this.state= {
      messages: [],
    }
  };
  
  
  componentDidMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          craetedAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: 'This is a system message',
          craetedAt: new Date(),
          system: true,
        },
      ],
    })
  };
  
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  };



  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }
  
  render() {
    //entered name state from Start screen gets displayed in status bar at the top of the app
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name});

    const { bgColor } = this.props.route.params;
    { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}

    <GiftedChat
    renderBubble={this.renderBubble.bind(this)}
    messages={this.state.messages}
    onSend={messages => this.onSend(messages)}
    user={{
      _id: 1,
    }}
  />

    return (
      <TouchableOpacity
      accessible={true}
      accessibilityLabel="More Options"
      accessibilityHint="Lets you choose to send an image or your geolocation"
      accessibilityRole="button"
      onPress={this._onPress}>
        <View style={{
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: bgColor
          }}>
          <Text>Hello Chat!</Text>
        </View>
      </TouchableOpacity>
    )
  }
}