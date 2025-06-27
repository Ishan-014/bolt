import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import { AuthWrapper } from "./components/AuthWrapper";
import {
  IntroLoading,
  Outage,
  OutOfMinutes,
  Conversation,
  Settings,
  Homepage,
} from "./screens";

function App() {
  const [{ currentScreen }] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "introLoading":
        return <IntroLoading />;
      case "outage":
        return <Outage />;
      case "outOfMinutes":
        return <OutOfMinutes />;
      case "settings":
        return <Settings />;
      case "conversation":
        return <Conversation />;
      case "homepage":
      default:
        return <Homepage />;
    }
  };

  // Always use full screen layout
  return (
    <AuthWrapper>
      <main className="h-svh w-full bg-black">
        {renderScreen()}
      </main>
    </AuthWrapper>
  );
}

export default App;