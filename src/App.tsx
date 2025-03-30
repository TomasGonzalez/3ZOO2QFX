import ChatComponent from './components/chat-component';

const CHAT_NAME_SPACE = 'autarc-chat'
const USER_NAME = "Tomas Gonzalez"

function App() {
  return (
    <div>
      Write some comment bellow:
      <ChatComponent userName={USER_NAME} nameSpace={CHAT_NAME_SPACE} />
    </div>
  );
}

export default App;
