import React from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, SystemMessage } from 'react-native-gifted-chat';
import firebase from 'firebase';
import 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo'
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

const firebaseConfig = {
  apiKey: "AIzaSyB89JIH4o0uiyxOBX6tEIAKKxN7Typqa58",
  authDomain: "chatapp-e80da.firebaseapp.com",
  projectId: "chatapp-e80da",
  storageBucket: "chatapp-e80da.appspot.com",
  messagingSenderId: "289720906499",
  appId: "1:289720906499:web:b6857970572bc41fb5af36"
};

export default class Chat extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      messages: [],
      uid: 1,
      user: {
        _id: 1,
        name: "",
        avatar: "",
      },
      image: null,
      location: null,
      isConnected: false,
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  async getMessages() {
    let messages = '';
    try {
      messages = (await AsyncStorage.getItem('messages')) || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    const name = this.props.route.params.name;

    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {

        this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);

        this.authUnsubscribe = firebase.auth()
          .onAuthStateChanged((user) => {
            if (!user) {
              firebase.auth().signInAnonymously();
            }

            this.setState({
              uid: user.uid,
              user: {
                _id: user.uid,
                name: name,
                avatar: ""
              },
              isConnected: true,
            });
          });


        // system message when user enters chat room
        const systemMsg = {
            _id: Math.floor(Math.random() * 100000),
            text: `Welcome to ChatApp ${name}`,
            createdAt: new Date(),
            system: true
        };

        this.referenceChatMessages.add(systemMsg);
        // save to local AsyncStorage
        this.saveMessages();
      } else {
        console.log('offline');
        this.setState({ isConnected: false })
        // get saved messages from local AsyncStorage
        this.getMessages()
      }
    });
  }

  componentWillUnmount() {
      // stop listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribe();
  };

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data()
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        system: data.system,
        image: data.image,
        location: data.location
      });
    });
    this.setState({
      messages: messages,
    });
  };


  addMessage = () => {
    // add a new messages to the collection
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
        uid: this.state.uid,
        _id: message._id,
        text: message.text || '',
        createdAt: message.createdAt,
        user: this.state.user,
        image: message.image || "",
        location: message.location || null,
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
    () => {
      this.addMessage()
      this.saveMessages()
    })
  };

  renderInputToolbar = (props) => {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar
        {...props}
        />
      );
    }
  }

  renderSystemMessage = (props) => {
    return <SystemMessage {...props} textStyle={{ color: "#fff" }} />;
  }

  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#A2B07A'
          },
          left: {
            backgroundColor: '#696B6E' 
          }
        }}
      />
    )
  }

  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  }
  
  renderCustomView (props) {
    const { currentMessage} = props;
    if (currentMessage.location) {
      return (
          <MapView
            style={{width: 150,
              height: 100,
              borderRadius: 13,
              margin: 3}}
            region={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
      );
    }
    return null;
  }

  render() {

    //changes bgcolor on chat screen
    const { bgColor } = this.props.route.params;

    return (
      <View style={{flex: 1,
        backgroundColor: bgColor
      }}>
        <GiftedChat
          renderBubble={this.renderBubble}
          renderSystemMessage={this.renderSystemMessage}
          renderInputToolbar={this.renderInputToolbar}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          renderActions={this.renderCustomActions}
          user={{
                _id: this.state.user._id,
                name: this.state.user.name,
            }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}