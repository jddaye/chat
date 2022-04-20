import React from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import firebase from "firebase";
import "firebase/firestore";

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
  
    addMessages() { 
      // add a new messages to the collection
      this.referenceChatMessages.add({
        _id: data._id,
        text: 'Test',
        createdAt: data.createdAt.toDate(),
        uid: this.state.uid,
      });
    };


  
  componentDidMount() {
    const name = this.props.route.params.name;

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

    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: 'This is a system message',
          createdAt: new Date(),
          system: true,
         },
      ],
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    })),
    () => {
      this.addMessages();
    }
  };

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeListUser();
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