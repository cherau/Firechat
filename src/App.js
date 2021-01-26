import React, { useState, useRef } from "react";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";
import "./styles.css";

if (!firebase.apps.length) {
  firebase.initializeApp({
    // add api config here
  });
} else {
  firebase.app();
}

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h4>FireChat 🔥</h4>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
      <script src="https://www.gstatic.com/firebasejs/8.2.4/firebase-app.js"></script>
      <script src="https://www.gstatic.com/firebasejs/8.2.4/firebase-analytics.js"></script>
    </div>
  );
}
function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt, displayName } = props.message;
  const date = createdAt ? createdAt.toDate().toDateString().substring(4) : "";
  const time = createdAt ? createdAt.toDate().toLocaleTimeString() : "";
  //console.log(date, time);
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} title={displayName} />
        <p>{text}</p>
      </div>
      <h6 align={`${messageClass}` == "sent" ? "right" : "left"}>
        {time} - {date}
      </h6>
    </>
  );
}
function ChatRoom() {
  const scroller = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt");
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName, phoneNumber, email } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
      phoneNumber,
      email
    });
    setFormValue("");
    scroller.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={scroller}> </span>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={!formValue}>
          🚀
        </button>
      </form>
    </>
  );
}
export default App;
