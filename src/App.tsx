import ChatComponent from './components/chat-component';

const CHAT_NAME_SPACE = 'autarc-chat'

function App() {
  return (
    <div>
      Write some comment bellow:
      <ChatComponent nameSpace={CHAT_NAME_SPACE} />
    </div>
  );
}

export default App;
