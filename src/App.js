import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "<removed for security> ",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
});


const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

const sentMessageStyle = {border:'1px solid black', textAlign:'left', maxWidth:'400px', margin:'0 auto'};
const recMessageStyle = {border:'1px solid black', textAlign:'right', maxWidth:'400px', margin:'0 auto'};
const sentFloat = {float: 'left'};
const recFloat = {float:'right'};
function App() {

  const [user] = useAuthState(auth);

  return (
      <div className="App">
        <header>
          <h1>react, firebase, chat</h1>
          <SignOut />
        </header>

        <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>

      </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
      <>
        <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
        <p>THIS IS A DEMO THIS IS ONLY A DEMO</p>
      </>
  )

}

function SignOut() {
  return auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const messageStyle = uid === auth.currentUser.uid ? sentMessageStyle : recMessageStyle;
  return (<>
    <div style={messageStyle} className={`message ${messageClass}`}>
      <img  src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;


