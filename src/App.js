import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyD7m6RS0hf_TISPqqsROuPoVY-y8ohtgS8",
  authDomain: "doklad-62a7d.firebaseapp.com",
  projectId: "doklad-62a7d",
  storageBucket: "doklad-62a7d.appspot.com",
  messagingSenderId: "244260161425",
  appId: "1:244260161425:web:e866ebd646d2b678847c30",
  measurementId: "G-CJZC51JB8B"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Чат v1</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          console.log(userCredential.user)
      })
      .catch((error) => {
          console.log(error.code, error.message)
      });
  }

  return (
    <>
      <input
        value={email} 
        onChange={e => {
            setEmail(e.target.value)
        }} 
        placeholder="Логин" 
      />
      <input 
        value={password} 
        onChange={e => {
            setPassword(e.target.value)
        }} 
        placeholder="Пароль"
        type={"password"}
      />
      <button className="sign-in" onClick={signIn}>Войти</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Выйти</button>
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
    
    const { uid, photoURL, email } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      email
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

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="напишите чтото хорошее;)" />

      <button type="submit" disabled={!formValue}>Отправить</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, email, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  const newDate = new Date(createdAt.toDate());
  const date = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate();
  const month = newDate.getMonth() < 10 ? '0' + (newDate.getMonth() + 1) : newDate.getMonth() + 1; 
  const hour = newDate.getHours();
  const minute = newDate.getMinutes();
  const sec = newDate.getSeconds();

  return (
    <>
      <div className={`message ${messageClass}`}>
        <label>{`${date}.${month} ${hour}:${minute}:${sec} - ${email}`}</label>
      </div>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://cdn.pixabay.com/photo/2021/06/01/07/03/sparrow-6300790_960_720.jpg'} />
        <p  >{text}</p>
      </div>
    </>
  )
}


export default App;
