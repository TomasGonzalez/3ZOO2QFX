import { useRef } from 'react';
import ChatComponent from './components/chat-component';

// Both of these values are mocked as constants so we can fill it in the component whenever we use it in a real app. 
// This way the Chat component can serve as a drop in solution.
const CHAT_NAME_SPACE = 'autarc-chat'

function App() {
  const userNameRef = useRef<string>(`test-user-#${(Math.floor(Math.random() * 100000))}`)
  return (<div className="flex justify-center items-center min-h-screen flex-col w-full bg-gray-200 text-gray-800" >
    <h1 className="text-2xl md:text-3xl font-bold mb-6">
      Write some comments below:
    </h1>
    <div className="w-full max-w-2xl">
      <ChatComponent userName={userNameRef.current} nameSpace={CHAT_NAME_SPACE} />
    </div>
  </div>
  );
}

export default App;
