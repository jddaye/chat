import React from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import firebase from "firebase";
import "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo'

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
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages: messages,
    });
  };

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
        console.log('online');
      } else {
        console.log('offline');
      }
    });

    this.unsubscribe = this.referenceChatMessages
    .orderBy("createdAt", "desc")
    .onSnapshot(this.onCollectionUpdate);
    
    this.authUnsubscribe = firebase
      .auth()
      .onAuthStateChanged((user) => {
        if (!user) {
          firebase.auth().signInAnonymously();
        }

    this.setState({
      uid: user.uid,
      messages: [],
      user: {
        _id: user.uid,
        name: name,
      },
     });
    });
    this.saveMessages();
  }

  addMessage = () => {
    // add a new messages to the collection
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
        uid: this.state.uid,
        _id: message._id,
        text: message.text || '',
        createdAt: message.createdAt,
        user: this.state.user,
        image: message.image || null,
        location: message.location || null
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    })),
    () => {
      this.saveMessages();
    }
  };

  componentWillUnmount() {
    NetInfo.fetch().then((connection) => {
      if(connection.isConnected) {
      // stop listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribeListUser();
      }
    })
  };

  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar
        {...props}
        />
      );
    }
  }

  renderBubble(props) {
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
  
  render() {
    //Updates name on chat screen
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name});

    //changes bgcolor on chat screen
    const { bgColor } = this.props.route.params;

    return (
      <View style={{flex: 1,
      backgroundColor: bgColor
      }}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}