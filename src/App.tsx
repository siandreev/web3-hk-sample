import {AppRoot, Placeholder} from "@xelene/tgui";
import {TonConnectUIProvider} from "@tonconnect/ui-react";
import {Header} from "./Header.tsx";

function App() {
    return <TonConnectUIProvider manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json">
        <AppRoot>
            <Header />
            <Placeholder
                header="Title"
                description="Description"
            >
                <img
                    alt="Telegram sticker"
                    src="https://xelene.me/telegram.gif"
                    style={{ display: 'block', width: '144px', height: '144px' }}
                />
            </Placeholder>
        </AppRoot>
    </TonConnectUIProvider>
}

export default App
